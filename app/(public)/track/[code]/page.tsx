import React from "react";
import { notFound } from "next/navigation";
import { getOrderByTrackingCode } from "@/actions/orders";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { TrackingTimeline } from "@/components/shared/TrackingTimeline";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { ImageComparator } from "@/components/shared/ImageComparator";
import { ThermalReceipt } from "@/components/shared/ThermalReceipt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  Phone,
  Store,
  Truck,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Printer,
} from "lucide-react";
import Link from "next/link";

interface TrackingPageProps {
  params: {
    code: string;
  };
  searchParams?: {
    new?: string;
  };
}

export default async function TrackingDetailPage({ params, searchParams }: TrackingPageProps) {
  const code = params.code?.toUpperCase();
  const res = await getOrderByTrackingCode(code);

  if (!res.success || !res.data) {
    return (
      <div className="container py-20 text-center space-y-6 max-w-lg">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Pesanan Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">
          Kode tracking <span className="font-mono font-bold text-slate-900">{code}</span> tidak terdaftar di sistem kami.
        </p>
        <Button asChild className="rounded-full bg-sky-500 hover:bg-sky-600 font-bold">
          <Link href="/track">Cari Resi Lain</Link>
        </Button>
      </div>
    );
  }

  const order = res.data;
  const isNewOrder = searchParams?.new === "true";

  const waMessage = encodeURIComponent(
    `Halo Admin SO CLEAN, saya ingin menanyakan status pesanan nomor resi ${order.trackingCode} (${order.customerName}).`
  );
  const waUrl = `https://wa.me/6281234567890?text=${waMessage}`;

  return (
    <div className="container py-8 md:py-12 space-y-8 max-w-5xl">
      {/* Top Banner if Just Booked */}
      {isNewOrder && (
        <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 shadow-sm">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Pemesanan Berhasil Dikonfirmasi!</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Simpan nomor resi Anda untuk memantau progress pengerjaan cuci sepatu secara real-time.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full px-5 shrink-0 shadow-sm">
            <a href={waUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="w-4 h-4 mr-1.5" /> Konfirmasi ke Admin
            </a>
          </Button>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <Link
            href="/track"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-sky-500 transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Lacak Pesanan Lain
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-mono">
              {order.trackingCode}
            </h1>
            <OrderStatusBadge status={order.orderStatus} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Thermal / E-Nota Print */}
          <ThermalReceipt order={order as any} triggerLabel="Cetak E-Nota" />

          <Button asChild variant="outline" size="sm" className="gap-2 font-bold rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 text-xs">
            <a href={waUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>Chat WhatsApp Workshop</span>
            </a>
          </Button>
        </div>
      </div>

      {/* 1. Workshop Progress Stepper */}
      <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <h3 className="text-base font-black text-slate-900">Live Workshop Status</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Update Otomatis 24/7</span>
        </div>
        <div className="pt-2">
          <TrackingTimeline currentStatus={order.orderStatus} />
        </div>
      </div>

      {/* 2. Order Information & Before/After Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Shoes & Before/After Comparators */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-slate-900">
              Detail Sepatu & Dokumentasi ({order.items.length} Pasang)
            </h3>
          </div>

          {order.items.map((item, idx) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] overflow-hidden"
            >
              <div className="bg-sky-50/50 px-6 py-3.5 border-b border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-black text-sky-700 uppercase mr-2">
                    Item #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {item.shoeBrand} {item.shoeModel}
                  </span>
                </div>
                <Badge variant="outline" className="font-mono text-xs rounded-full border-sky-200 text-sky-700">
                  {item.serviceName}
                </Badge>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Item Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Varian Warna</span>
                    <span className="font-bold text-slate-800">{item.shoeColor || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Biaya Treatment</span>
                    <span className="font-mono font-black text-sky-600">{formatRupiah(item.price)}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Catatan Khusus</span>
                    <span className="font-medium text-slate-700">{item.specialNotes || "Standar Care"}</span>
                  </div>
                </div>

                {/* Interactive Before & After Visual Comparator */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    Dokumentasi Visual Sebelum & Sesudah:
                  </span>
                  <div className="max-w-md mx-auto">
                    <ImageComparator
                      beforeImageUrl={item.beforeImageUrl}
                      afterImageUrl={item.afterImageUrl}
                      shoeBrand={item.shoeBrand || "Sneaker"}
                      shoeModel={item.shoeModel || "Care"}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right 4 Cols: Logistics & Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Informasi Pemesan</h3>
              <ThermalReceipt order={order as any} triggerLabel="Cetak" />
            </div>

            <div>
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Nama Pelanggan</span>
              <span className="font-bold text-slate-900 text-sm">{order.customerName}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Nomor WhatsApp</span>
              <span className="font-mono font-bold text-slate-800">{order.customerPhone}</span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Metode Serah Terima</span>
              <div className="flex items-center gap-2 mt-1">
                {order.serviceType === "DROP_OFF" ? (
                  <>
                    <Store className="w-4 h-4 text-sky-500" />
                    <span className="font-bold text-slate-800">Drop-Off di Workshop</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-sky-500" />
                    <span className="font-bold text-slate-800">Pickup & Delivery Kurir</span>
                  </>
                )}
              </div>
              {order.deliveryAddress && (
                <p className="text-slate-600 mt-1 bg-slate-50 p-3 rounded-2xl text-xs leading-relaxed border border-slate-100">
                  {order.deliveryAddress}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Waktu Pemesanan</span>
              <span className="font-mono text-slate-600">
                {formatDateTime(order.createdAt)}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Total Tagihan</span>
              <span className="font-mono font-black text-xl text-sky-600">
                {formatRupiah(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
