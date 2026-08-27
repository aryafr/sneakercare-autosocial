import React from "react";
import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/orders";
import { OrderDetailClient } from "./OrderDetailClient";

export const revalidate = 0;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: order } = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}
