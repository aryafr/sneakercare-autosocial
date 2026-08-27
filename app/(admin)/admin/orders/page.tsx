import React from "react";
import Link from "next/link";
import { getAdminOrders } from "@/actions/orders";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, ExternalLink, PlusCircle, Filter } from "lucide-react";

export const revalidate = 0;

export default async function AdminOrdersListPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const statusFilter = searchParams?.status || "ALL";
  const { data: orders = [] } = await getAdminOrders(statusFilter);

  const STATUS_FILTERS = [
    { label: "Semua", value: "ALL" },
    { label: "Antrian Masuk", value: "RECEIVED" },
    { label: "Dalam Pengerjaan", value: "IN_PROGRESS" },
    { label: "Sedang Dicuci", value: "WASHED" },
    { label: "Pengeringan", value: "DRYING" },
    { label: "Siap Diambil", value: "READY" },
    { label: "Selesai", value: "COMPLETED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Manajemen Antrean Workshop
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Filter status pengerjaan, unggah dokumentasi foto Before & After, dan pantau histori pesanan.
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_FILTERS.map((f) => {
          const isActive = statusFilter === f.value;
          return (
            <Button
              key={f.value}
              asChild
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`rounded-full text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? "bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-400/25 border-transparent"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Link href={`/admin/orders?status=${f.value}`}>{f.label}</Link>
            </Button>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] overflow-hidden">
        <div>
          {orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Tidak ada pesanan dengan filter status ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/70 text-slate-400 uppercase font-bold border-b border-slate-100 text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Kode Resi</th>
                    <th className="px-6 py-3.5">Pelanggan</th>
                    <th className="px-6 py-3.5">Item Sepatu</th>
                    <th className="px-6 py-3.5">Status Pengerjaan</th>
                    <th className="px-6 py-3.5">Pembayaran</th>
                    <th className="px-6 py-3.5">Tagihan</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        <Link href={`/admin/orders/${ord.id}`} className="hover:text-sky-500">
                          {ord.trackingCode}
                        </Link>
                        <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                          {formatDateTime(ord.createdAt)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block text-sm">{ord.customerName}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{ord.customerPhone}</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {ord.items?.map((item: any) => (
                            <div key={item.id} className="text-xs">
                              <span className="font-semibold text-slate-800">{item.shoeBrand} {item.shoeModel}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <OrderStatusBadge status={ord.orderStatus} />
                      </td>

                      <td className="px-6 py-4">
                        <PaymentStatusBadge status={ord.paymentStatus} />
                      </td>

                      <td className="px-6 py-4 font-mono font-black text-sky-600 text-sm">
                        {formatRupiah(ord.totalAmount)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button asChild size="sm" variant="outline" className="h-8 text-xs rounded-full border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200">
                          <Link href={`/admin/orders/${ord.id}`}>
                            <UploadCloud className="w-3.5 h-3.5 mr-1" /> Kelola & Foto
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
