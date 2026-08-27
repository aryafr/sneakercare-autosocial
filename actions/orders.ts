"use server";

import { db } from "@/db";
import { initDb } from "@/db/init";
import { orders, orderItems, services, type Order, type OrderItem } from "@/db/schema";
import { generateTrackingCode } from "@/lib/utils";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Fetch all active services
 */
export async function getServices() {
  try {
    await initDb();
    const list = await db.select().from(services).where(eq(services.isActive, true));
    return { success: true, data: list };
  } catch (err: any) {
    console.error("Error fetching services:", err);
    return { success: false, error: err.message || "Gagal memuat layanan" };
  }
}

/**
 * Create a new customer booking order
 */
export async function createOrder(input: CreateOrderInput) {
  try {
    await initDb();
    const validated = createOrderSchema.parse(input);

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const trackingCode = generateTrackingCode();

    const totalAmount = validated.items.reduce((sum, item) => sum + item.price, 0);

    // Insert order
    await db.insert(orders).values({
      id: orderId,
      trackingCode,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      customerEmail: validated.customerEmail || null,
      serviceType: validated.serviceType,
      deliveryAddress: validated.deliveryAddress || null,
      totalAmount,
      paymentStatus: "UNPAID",
      orderStatus: "RECEIVED",
      paymentReference: `PAY-${Date.now()}`,
    });

    // Insert order items
    for (const item of validated.items) {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(orderItems).values({
        id: itemId,
        orderId,
        serviceId: item.serviceId,
        shoeBrand: item.shoeBrand,
        shoeModel: item.shoeModel,
        shoeColor: item.shoeColor || null,
        specialNotes: item.specialNotes || null,
        price: item.price,
      });
    }

    try {
      revalidatePath("/admin/dashboard");
      revalidatePath(`/track/${trackingCode}`);
    } catch {}

    return {
      success: true,
      orderId,
      trackingCode,
      totalAmount,
    };
  } catch (err: any) {
    console.error("Error creating order:", err);
    return {
      success: false,
      error: err.errors ? err.errors.map((e: any) => e.message).join(", ") : err.message || "Gagal membuat pesanan",
    };
  }
}

/**
 * Get order and its items by tracking code for Public Tracking Screen
 */
export async function getOrderByTrackingCode(trackingCode: string) {
  try {
    await initDb();
    if (!trackingCode) {
      return { success: false, error: "Kode tracking tidak valid" };
    }

    const cleanCode = trackingCode.trim().toUpperCase();
    const [order] = await db.select().from(orders).where(eq(orders.trackingCode, cleanCode)).limit(1);

    if (!order) {
      return { success: false, error: "Pesanan dengan kode ini tidak ditemukan." };
    }

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        serviceId: orderItems.serviceId,
        serviceName: services.name,
        shoeBrand: orderItems.shoeBrand,
        shoeModel: orderItems.shoeModel,
        shoeColor: orderItems.shoeColor,
        specialNotes: orderItems.specialNotes,
        price: orderItems.price,
        beforeImageUrl: orderItems.beforeImageUrl,
        afterImageUrl: orderItems.afterImageUrl,
        createdAt: orderItems.createdAt,
      })
      .from(orderItems)
      .leftJoin(services, eq(orderItems.serviceId, services.id))
      .where(eq(orderItems.orderId, order.id));

    return {
      success: true,
      data: {
        ...order,
        items,
      },
    };
  } catch (err: any) {
    console.error("Error fetching order by tracking code:", err);
    return { success: false, error: err.message || "Gagal mengambil data pesanan" };
  }
}

/**
 * Get order detail by ID for Admin/Operator Workspace
 */
export async function getOrderById(id: string) {
  try {
    await initDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        serviceId: orderItems.serviceId,
        serviceName: services.name,
        shoeBrand: orderItems.shoeBrand,
        shoeModel: orderItems.shoeModel,
        shoeColor: orderItems.shoeColor,
        specialNotes: orderItems.specialNotes,
        price: orderItems.price,
        beforeImageUrl: orderItems.beforeImageUrl,
        afterImageUrl: orderItems.afterImageUrl,
        createdAt: orderItems.createdAt,
      })
      .from(orderItems)
      .leftJoin(services, eq(orderItems.serviceId, services.id))
      .where(eq(orderItems.orderId, order.id));

    return {
      success: true,
      data: {
        ...order,
        items,
      },
    };
  } catch (err: any) {
    console.error("Error fetching order by id:", err);
    return { success: false, error: err.message || "Gagal mengambil data order" };
  }
}

/**
 * Update order status (State Machine)
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: "RECEIVED" | "IN_PROGRESS" | "WASHED" | "DRYING" | "READY" | "COMPLETED" | "CANCELLED"
) {
  try {
    await db
      .update(orders)
      .set({
        orderStatus: newStatus,
        updatedAt: sql`(strftime('%s', 'now'))`,
      })
      .where(eq(orders.id, orderId));

    try {
      revalidatePath("/admin/dashboard");
      revalidatePath(`/admin/orders/${orderId}`);
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error("Error updating order status:", err);
    return { success: false, error: err.message || "Gagal memperbarui status" };
  }
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: "UNPAID" | "PAID" | "EXPIRED" | "REFUNDED"
) {
  try {
    await db
      .update(orders)
      .set({
        paymentStatus,
        updatedAt: sql`(strftime('%s', 'now'))`,
      })
      .where(eq(orders.id, orderId));

    try {
      revalidatePath("/admin/dashboard");
      revalidatePath(`/admin/orders/${orderId}`);
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error("Error updating payment status:", err);
    return { success: false, error: err.message || "Gagal memperbarui status bayar" };
  }
}

/**
 * Save Before/After photo URL for an order item
 */
export async function updateItemImages(
  itemId: string,
  data: { beforeImageUrl?: string; afterImageUrl?: string }
) {
  try {
    await db
      .update(orderItems)
      .set({
        ...(data.beforeImageUrl ? { beforeImageUrl: data.beforeImageUrl } : {}),
        ...(data.afterImageUrl ? { afterImageUrl: data.afterImageUrl } : {}),
      })
      .where(eq(orderItems.id, itemId));

    try {
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/social/new");
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error("Error updating item images:", err);
    return { success: false, error: err.message || "Gagal mengunggah foto" };
  }
}

/**
 * Get all orders with status filter for Admin Dashboard
 */
export async function getAdminOrders(statusFilter?: string) {
  try {
    await initDb();
    const whereClause =
      statusFilter && statusFilter !== "ALL"
        ? eq(orders.orderStatus, statusFilter as any)
        : undefined;

    const orderList = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt));

    // Fetch items for each order
    const populated = await Promise.all(
      orderList.map(async (ord) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, ord.id));
        return {
          ...ord,
          itemCount: items.length,
          items,
        };
      })
    );

    return { success: true, data: populated };
  } catch (err: any) {
    console.error("Error fetching admin orders:", err);
    return { success: false, error: err.message || "Gagal memuat antrean workshop" };
  }
}

/**
 * Calculate Workshop Dashboard Statistics
 */
export async function getDashboardMetrics() {
  try {
    await initDb();
    const allOrders = await db.select().from(orders);

    let totalRevenue = 0;
    let newOrdersToday = 0;
    let inProgressCount = 0;
    let readyCount = 0;
    let completedCount = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodaySec = Math.floor(startOfToday.getTime() / 1000);

    for (const ord of allOrders) {
      if (ord.paymentStatus === "PAID") {
        totalRevenue += ord.totalAmount;
      }

      const createdSec =
        ord.createdAt instanceof Date
          ? Math.floor(ord.createdAt.getTime() / 1000)
          : Number(ord.createdAt);

      if (createdSec >= startOfTodaySec) {
        newOrdersToday++;
      }

      if (ord.orderStatus === "IN_PROGRESS" || ord.orderStatus === "WASHED" || ord.orderStatus === "DRYING") {
        inProgressCount++;
      } else if (ord.orderStatus === "READY") {
        readyCount++;
      } else if (ord.orderStatus === "COMPLETED") {
        completedCount++;
      }
    }

    return {
      success: true,
      data: {
        totalRevenue,
        newOrdersToday,
        inProgressCount,
        readyCount,
        completedCount,
        totalOrders: allOrders.length,
      },
    };
  } catch (err: any) {
    console.error("Error computing dashboard metrics:", err);
    return {
      success: false,
      data: {
        totalRevenue: 0,
        newOrdersToday: 0,
        inProgressCount: 0,
        readyCount: 0,
        completedCount: 0,
        totalOrders: 0,
      },
    };
  }
}

/**
 * Get Before/After pairs for public showcase gallery
 */
export async function getShowcasePairs() {
  try {
    await initDb();
    const items = await db
      .select({
        id: orderItems.id,
        brand: orderItems.shoeBrand,
        model: orderItems.shoeModel,
        treatment: services.name,
        note: orderItems.specialNotes,
        beforeImage: orderItems.beforeImageUrl,
        afterImage: orderItems.afterImageUrl,
      })
      .from(orderItems)
      .leftJoin(services, eq(orderItems.serviceId, services.id))
      .where(sql`${orderItems.beforeImageUrl} IS NOT NULL AND ${orderItems.afterImageUrl} IS NOT NULL`)
      .limit(6);

    return {
      success: true,
      data: items.filter((i) => Boolean(i.beforeImage && i.afterImage)),
    };
  } catch (err: any) {
    console.error("Error fetching showcase pairs:", err);
    return { success: false, data: [] };
  }
}

/**
 * Get recent active tracking codes for search suggestions
 */
export async function getRecentTrackingCodes() {
  try {
    await initDb();
    const list = await db
      .select({
        trackingCode: orders.trackingCode,
        customerName: orders.customerName,
        orderStatus: orders.orderStatus,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(4);

    return { success: true, data: list };
  } catch (err: any) {
    console.error("Error fetching recent tracking codes:", err);
    return { success: false, data: [] };
  }
}




