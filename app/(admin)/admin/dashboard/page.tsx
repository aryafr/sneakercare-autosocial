import React from "react";
import Link from "next/link";
import { getDashboardMetrics, getAdminOrders } from "@/actions/orders";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Package,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  UploadCloud,
  Share2,
  ExternalLink,
  PlusCircle,
  TrendingUp,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const { data: metrics } = await getDashboardMetrics();
  const { data: orders = [] } = await getAdminOrders();

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Workshop Kanban Board
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola antrean pencucian sepatu, update tahapan pengerjaan unit, dan jadwalkan postingan Instagram.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="font-bold rounded-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white shadow-md shadow-sky-400/20 text-xs px-4">
            <Link href="/admin/social/new">
              <Share2 className="w-3.5 h-3.5 mr-1.5" /> Jadwalkan Post Instagram
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white border border-sky-100 p-6 shadow-[0_10px_30px_rgba(0,194,255,0.06)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Omset Lunas</span>
            <div className="text-2xl font-black font-mono text-sky-600">
              {formatRupiah(metrics?.totalRevenue || 0)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-sky-100 p-6 shadow-[0_10px_30px_rgba(0,194,255,0.06)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Hari Ini</span>
            <div className="text-2xl font-black font-mono text-slate-900">
              {metrics?.newOrdersToday || 0}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-sky-100 p-6 shadow-[0_10px_30px_rgba(0,194,255,0.06)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dalam Pengerjaan</span>
            <div className="text-2xl font-black font-mono text-amber-600">
              {metrics?.inProgressCount || 0}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-sky-100 p-6 shadow-[0_10px_30px_rgba(0,194,255,0.06)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Siap Diambil</span>
            <div className="text-2xl font-black font-mono text-emerald-600">
              {metrics?.readyCount || 0}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Orders Table & Action Feed */}
      <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-base">Antrean Pesanan Aktif</h3>
            <p className="text-xs text-slate-400">Semua pesanan yang masuk dan riwayat pencucian sepatu.</p>
          </div>
          <Badge variant="secondary" className="font-mono text-xs rounded-full">
            Total {orders.length} Pesanan
          </Badge>
        </div>

        <div>
          {orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-medium">Belum ada pesanan terdaftar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/70 text-slate-400 uppercase font-bold border-b border-slate-100 text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Kode Resi</th>
                    <th className="px-6 py-3.5">Pelanggan</th>
                    <th className="px-6 py-3.5">Sepatu & Item</th>
                    <th className="px-6 py-3.5">Status Pengerjaan</th>
                    <th className="px-6 py-3.5">Pembayaran</th>
                    <th className="px-6 py-3.5">Total</th>
                    <th className="px-6 py-3.5 text-right">Aksi Workshop</th>
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
                              {item.beforeImageUrl && item.afterImageUrl && (
                                <Badge variant="success" className="ml-1 text-[9px] px-1 py-0 rounded-full">
                                  B/A Ready
                                </Badge>
                              )}
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
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild size="sm" variant="outline" className="h-8 text-xs rounded-full border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200">
                            <Link href={`/admin/orders/${ord.id}`}>
                              <UploadCloud className="w-3.5 h-3.5 mr-1" /> Intake & Foto
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                            <Link href={`/track/${ord.trackingCode}`} target="_blank" title="Buka Halaman Tracking Pelanggan">
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-sky-500" />
                            </Link>
                          </Button>
                        </div>
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
