import { NextRequest, NextResponse } from "next/server";
import { updateOrderPaymentStatus } from "@/actions/orders";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Midtrans standard payload inspection
    const orderId = body.order_id || body.external_id || body.orderId;
    const transactionStatus = body.transaction_status || body.status;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
    }

    // Find order by ID or payment reference or tracking code
    let [targetOrder] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!targetOrder) {
      [targetOrder] = await db.select().from(orders).where(eq(orders.trackingCode, orderId)).limit(1);
    }

    if (!targetOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      transactionStatus === "settlement" ||
      transactionStatus === "capture" ||
      transactionStatus === "PAID" ||
      transactionStatus === "COMPLETED"
    ) {
      await updateOrderPaymentStatus(targetOrder.id, "PAID");
    } else if (
      transactionStatus === "expire" ||
      transactionStatus === "cancel" ||
      transactionStatus === "deny"
    ) {
      await updateOrderPaymentStatus(targetOrder.id, "EXPIRED");
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Payment webhook error:", err);
    return NextResponse.json({ error: err.message || "Webhook processing error" }, { status: 500 });
  }
}
