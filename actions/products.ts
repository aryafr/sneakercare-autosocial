"use server";

import { db } from "@/db";
import { products, productVariants, categories, type Product, type ProductVariant, type Category } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  categoryName?: string | null;
}

/**
 * Fetch all active marketplace products with their variants
 */
export async function getProductsList(categorySlug?: string) {
  try {
    let categoryId: string | undefined;
    if (categorySlug && categorySlug !== "all") {
      const [cat] = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
      if (cat) categoryId = cat.id;
    }

    const query = db
      .select({
        id: products.id,
        title: products.title,
        handle: products.handle,
        description: products.description,
        thumbnail: products.thumbnail,
        categoryId: products.categoryId,
        brand: products.brand,
        rating: products.rating,
        reviewCount: products.reviewCount,
        isActive: products.isActive,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(categoryId ? eq(products.categoryId, categoryId) : eq(products.isActive, true))
      .orderBy(desc(products.createdAt));

    const rawProducts = await query;

    // Attach variants
    const allVariants = await db.select().from(productVariants);

    const productList: ProductWithVariants[] = rawProducts.map((p) => {
      const pVariants = allVariants.filter((v) => v.productId === p.id);
      return {
        ...p,
        variants: pVariants,
      };
    });

    return { success: true, data: productList };
  } catch (err: any) {
    console.error("Error fetching products:", err);
    return { success: false, error: err.message || "Gagal memuat katalog produk" };
  }
}

/**
 * Fetch product detail by handle with all variants
 */
export async function getProductByHandle(handle: string) {
  try {
    const [product] = await db
      .select({
        id: products.id,
        title: products.title,
        handle: products.handle,
        description: products.description,
        thumbnail: products.thumbnail,
        categoryId: products.categoryId,
        brand: products.brand,
        rating: products.rating,
        reviewCount: products.reviewCount,
        isActive: products.isActive,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.handle, handle))
      .limit(1);

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id));

    return {
      success: true,
      data: {
        ...product,
        variants,
      },
    };
  } catch (err: any) {
    console.error("Error fetching product by handle:", err);
    return { success: false, error: err.message || "Gagal memuat detail produk" };
  }
}

/**
 * Fetch all categories
 */
export async function getCategories() {
  try {
    const list = await db.select().from(categories);
    return { success: true, data: list };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memuat kategori" };
  }
}
