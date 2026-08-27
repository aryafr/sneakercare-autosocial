"use server";

import { db } from "@/db";
import { carts, cartItems, discounts, orders, orderItems, type Cart, type CartItem } from "@/db/schema";
import { addToCartSchema, cartCheckoutSchema, type AddToCartInput, type CartCheckoutInput } from "@/lib/validations";
import { generateTrackingCode } from "@/lib/utils";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CartWithItems extends Cart {
  items: CartItem[];
}

/**
 * Retrieve or initialize a shopping cart
 */
export async function getOrCreateCart(cartId?: string): Promise<{ success: boolean; data?: CartWithItems; error?: string }> {
  try {
    let currentCartId = cartId;

    if (currentCartId) {
      const [existingCart] = await db.select().from(carts).where(eq(carts.id, currentCartId)).limit(1);
      if (existingCart) {
        const items = await db.select().from(cartItems).where(eq(cartItems.cartId, existingCart.id));
        return {
          success: true,
          data: {
            ...existingCart,
            items,
          },
        };
      }
    }

    // Create a new cart
    const newCartId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(carts).values({
      id: newCartId,
      subtotal: 0,
      discountAmount: 0,
      shippingTotal: 0,
      totalAmount: 0,
    });

    const [newCart] = await db.select().from(carts).where(eq(carts.id, newCartId)).limit(1);
    return {
      success: true,
      data: {
        ...newCart,
        items: [],
      },
    };
  } catch (err: any) {
    console.error("Error getting cart:", err);
    return { success: false, error: err.message || "Gagal memuat keranjang" };
  }
}

/**
 * Recalculate totals for a cart
 */
async function recalculateCart(cartId: string) {
  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [cart] = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);
  let discountAmount = 0;

  if (cart?.promoCode) {
    const [discount] = await db
      .select()
      .from(discounts)
      .where(and(eq(discounts.code, cart.promoCode), eq(discounts.isActive, true)))
      .limit(1);

    if (discount && subtotal >= discount.minSubtotal) {
      if (discount.discountType === "PERCENTAGE") {
        discountAmount = (subtotal * discount.value) / 100;
      } else {
        discountAmount = discount.value;
      }
    }
  }

  const shippingTotal = cart?.shippingTotal || 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingTotal);

  await db
    .update(carts)
    .set({
      subtotal,
      discountAmount,
      totalAmount,
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cartId));
}

/**
 * Add product or service item to cart
 */
export async function addItemToCart(input: AddToCartInput) {
  try {
    const validated = addToCartSchema.parse(input);

    const { data: cart } = await getOrCreateCart(validated.cartId);
    if (!cart) throw new Error("Gagal menginisialisasi keranjang");

    const cartItemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(cartItems).values({
      id: cartItemId,
      cartId: cart.id,
      itemType: validated.itemType,
      productId: validated.productId,
      variantId: validated.variantId,
      serviceId: validated.serviceId,
      title: validated.title,
      variantTitle: validated.variantTitle,
      thumbnail: validated.thumbnail,
      price: validated.price,
      quantity: validated.quantity || 1,
      metadata: validated.metadata ? JSON.stringify(validated.metadata) : null,
    });

    await recalculateCart(cart.id);

    try {
      revalidatePath("/shop");
    } catch {}

    const updated = await getOrCreateCart(cart.id);
    return { success: true, data: updated.data };
  } catch (err: any) {
    console.error("Error adding to cart:", err);
    return { success: false, error: err.message || "Gagal menambahkan ke keranjang" };
  }
}

/**
 * Update quantity of a cart item
 */
export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  try {
    const [item] = await db.select().from(cartItems).where(eq(cartItems.id, cartItemId)).limit(1);
    if (!item) return { success: false, error: "Item tidak ditemukan" };

    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
    } else {
      await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
    }

    await recalculateCart(item.cartId);
    const updated = await getOrCreateCart(item.cartId);
    return { success: true, data: updated.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah jumlah item" };
  }
}

/**
 * Apply promo/discount coupon to cart
 */
export async function applyCouponToCart(cartId: string, code: string) {
  try {
    const trimmed = code.trim().toUpperCase();
    const [discount] = await db
      .select()
      .from(discounts)
      .where(and(eq(discounts.code, trimmed), eq(discounts.isActive, true)))
      .limit(1);

    if (!discount) {
      return { success: false, error: "Kode promo tidak valid atau sudah kadaluarsa" };
    }

    const { data: cart } = await getOrCreateCart(cartId);
    if (!cart || cart.subtotal < discount.minSubtotal) {
      return {
        success: false,
        error: `Minimal pembelian Rp ${discount.minSubtotal.toLocaleString("id-ID")} untuk menggunakan kupon ini.`,
      };
    }

    await db.update(carts).set({ promoCode: trimmed }).where(eq(carts.id, cartId));
    await recalculateCart(cartId);

    const updated = await getOrCreateCart(cartId);
    return { success: true, data: updated.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menerapkan kupon" };
  }
}

/**
 * Checkout cart to Order workflow
 */
export async function checkoutCartWorkflow(input: CartCheckoutInput) {
  try {
    const validated = cartCheckoutSchema.parse(input);

    const { data: cart } = await getOrCreateCart(validated.cartId);
    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Keranjang belanja masih kosong" };
    }

    const trackingCode = generateTrackingCode();
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const shippingFee = validated.serviceType === "PICKUP_DELIVERY" ? 20000 : 0;
    const finalTotal = cart.subtotal - cart.discountAmount + shippingFee;

    // Create Order Record
    await db.insert(orders).values({
      id: orderId,
      trackingCode,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      customerEmail: validated.customerEmail || null,
      serviceType: validated.serviceType,
      deliveryAddress: validated.serviceType === "PICKUP_DELIVERY" ? validated.deliveryAddress : null,
      subtotal: cart.subtotal,
      discountAmount: cart.discountAmount,
      shippingFee,
      totalAmount: finalTotal,
      paymentMethod: validated.paymentMethod,
      paymentStatus: "UNPAID",
      orderStatus: "RECEIVED",
    });

    // Copy cart items to order_items
    for (const item of cart.items) {
      let meta: any = {};
      if (item.metadata) {
        try {
          meta = JSON.parse(item.metadata);
        } catch {}
      }

      await db.insert(orderItems).values({
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderId,
        itemType: item.itemType,
        serviceId: item.serviceId || "serv_product",
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        shoeBrand: meta.shoeBrand || (item.itemType === "PRODUCT" ? "SO CLEAN Care" : "Sneaker"),
        shoeModel: meta.shoeModel || item.variantTitle || item.title,
        shoeColor: meta.shoeColor || null,
        specialNotes: meta.specialNotes || null,
        quantity: item.quantity,
        price: item.price * item.quantity,
      });
    }

    // Delete cart after checkout
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    await db.delete(carts).where(eq(carts.id, cart.id));

    try {
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/orders");
    } catch {}

    return {
      success: true,
      orderId,
      trackingCode,
      totalAmount: finalTotal,
    };
  } catch (err: any) {
    console.error("Cart checkout error:", err);
    return { success: false, error: err.message || "Gagal memproses checkout" };
  }
}
