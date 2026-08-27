"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, updateOrderPaymentStatus, updateItemImages } from "@/actions/orders";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { DirectImageUpload } from "@/components/shared/DirectImageUpload";
import { ImageComparator } from "@/components/shared/ImageComparator";
import { ThermalReceipt } from "@/components/shared/ThermalReceipt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Store,
  Truck,
  MessageCircle,
  Share2,
  ExternalLink,
  Loader2,
  Droplets,
  Wind,
  PackageCheck,
  Ban,
  Send,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OrderDetailClientProps {
  order: any;
}

const STATUS_TRANSITIONS = [
  { status: "RECEIVED", label: "Antrian Masuk", icon: Clock },
  { status: "IN_PROGRESS", label: "Proses Treatment", icon: Sparkles },
  { status: "WASHED", label: "Selesai Dicuci", icon: Droplets },
  { status: "DRYING", label: "Pengeringan", icon: Wind },
  { status: "READY", label: "Siap Diambil", icon: PackageCheck },
  { status: "COMPLETED", label: "Selesai", icon: CheckCircle2 },
  { status: "CANCELLED", label: "Batalkan", icon: Ban },
];

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(order.orderStatus);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState(order.paymentStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const trackingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/track/${order.trackingCode}`
    : `http://localhost:3000/track/${order.trackingCode}`;

  // WhatsApp Message Generator based on status
  const getWhatsAppMessageForStatus = (status: string) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
    let text = "";

    const itemsSummary = order.items?.map((i: any) => `${i.shoeBrand} ${i.shoeModel} (${i.serviceName || "Deep Clean"})`).join(", ") || "Sepatu Anda";

    if (status === "RECEIVED") {
      text = `Halo Kak ${order.customerName},\n\nPesanan laundry sepatu Anda (${itemsSummary}) telah BERHASIL MASUK ke antrean Workshop SO CLEAN.\n\nNomor Resi: *${order.trackingCode}*\nTotal Biaya: *${formatRupiah(order.totalAmount)}*\n\nAnda dapat memantau progres pengerjaan dan foto Before/After secara real-time melalui link berikut:\n${trackingUrl}\n\nTerima kasih atas kepercayaannya! ✨`;
    } else if (status === "READY") {
      text = `KABAR GEMBIRA! ✨\n\nHalo Kak ${order.customerName}, sepatu Anda (${itemsSummary}) telah SELESAI menjalani treatment di Workshop SO CLEAN dan *SIAP UNTUK DIAMBIL / DIANTAR*.\n\nCek dokumentasi foto hasil Before & After pengerjaan kami di:\n${trackingUrl}\n\nMohon konfirmasi jika ingin diambil atau diantar via kurir. Terima kasih! 🙏`;
    } else if (status === "COMPLETED") {
      text = `Halo Kak ${order.customerName},\n\nTransaksi pesanan *${order.trackingCode}* telah dinyatakan SELESAI. Terima kasih telah mempercayakan perawatan sneakers Anda kepada SO CLEAN Workshop.\n\nSampai jumpa pada treatment berikutnya! 👟✨`;
    } else {
      text = `Halo Kak ${order.customerName},\n\nUpdate progres pesanan *${order.trackingCode}* (${itemsSummary}):\nStatus saat ini: *${status}* di Workshop SO CLEAN.\n\nPantau detail lengkapnya di:\n${trackingUrl}`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleStatusChange = async (newStatus: any) => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateOrderStatus(order.id, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        toast.success(`Status berhasil diubah menjadi ${newStatus}`);
        router.refresh();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async (newPayStatus: any) => {
    try {
      const res = await updateOrderPaymentStatus(order.id, newPayStatus);
      if (res.success) {
        setCurrentPaymentStatus(newPayStatus);
        toast.success("Status pembayaran diperbarui!");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui status bayar");
    }
  };

  const handleImageUploaded = async (itemId: string, type: "before" | "after", url: string) => {
    try {
      const res = await updateItemImages(itemId, {
        [type === "before" ? "beforeImageUrl" : "afterImageUrl"]: url,
      });

      if (res.success) {
        toast.success(`Foto ${type === "before" ? "Before" : "After"} berhasil disimpan.`);
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Gagal menyimpan URL foto ke database.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-sky-500 transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Antrean
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
              {order.trackingCode}
            </h1>
            <OrderStatusBadge status={currentStatus} />
            <PaymentStatusBadge status={currentPaymentStatus} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Thermal Receipt Print Button */}
          <ThermalReceipt order={order} triggerLabel="Cetak Label Resi" />

          {/* Public Track Link */}
          <Button asChild variant="outline" size="sm" className="gap-1.5 font-bold rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 text-xs">
            <Link href={`/track/${order.trackingCode}`} target="_blank">
              <ExternalLink className="w-3.5 h-3.5" /> Lacak Publik
            </Link>
          </Button>

          {/* Dynamic WhatsApp Notification Button */}
          <Button asChild size="sm" className="gap-1.5 font-bold rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-xs px-4">
            <a href={getWhatsAppMessageForStatus(currentStatus)} target="_blank" rel="noreferrer">
              <MessageCircle className="w-3.5 h-3.5" /> Kirim Notif WA Status
            </a>
          </Button>
        </div>
      </div>

      {/* State Machine Action Bar */}
      <div className="rounded-3xl border border-sky-100 bg-sky-50/40 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-black uppercase text-slate-900 tracking-wider">Ubah Status Pengerjaan (State Machine):</span>
            <p className="text-xs text-slate-400">Pilih tahapan untuk mengupdate progres workshop:</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {STATUS_TRANSITIONS.map((st) => {
              const isCurrent = currentStatus === st.status;
              const IconComp = st.icon;
              return (
                <Button
                  key={st.status}
                  size="sm"
                  variant={isCurrent ? "default" : "outline"}
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(st.status)}
                  className={`text-xs font-bold rounded-full gap-1.5 transition-all ${
                    isCurrent
                      ? "bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-400/25 border-transparent font-black"
                      : "border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{st.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Item-by-item Cards with Direct Camera & Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-black text-lg text-slate-900">
            Dokumentasi & Media Workshop ({order.items?.length || 0} Pasang)
          </h3>

          {order.items?.map((item: any, idx: number) => {
            const hasBothPhotos = Boolean(item.beforeImageUrl && item.afterImageUrl);

            return (
              <div key={item.id} className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] overflow-hidden">
                <div className="bg-sky-50/50 px-6 py-3.5 border-b border-sky-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-black text-sky-700 uppercase mr-2">
                      Sepatu #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {item.shoeBrand} {item.shoeModel}
                    </span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs rounded-full border-sky-200 text-sky-700">
                    {item.serviceName || "Treatment"}
                  </Badge>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
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
                      <span className="font-medium text-slate-700">{item.specialNotes || "Tidak ada catatan"}</span>
                    </div>
                  </div>

                  {/* Upload Controls Grid with Camera Support */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <DirectImageUpload
                      label="1. Foto Saat Masuk (BEFORE)"
                      initialImageUrl={item.beforeImageUrl}
                      onImageUploaded={(url) => handleImageUploaded(item.id, "before", url)}
                    />
                    <DirectImageUpload
                      label="2. Foto Selesai (AFTER)"
                      initialImageUrl={item.afterImageUrl}
                      onImageUploaded={(url) => handleImageUploaded(item.id, "after", url)}
                    />
                  </div>

                  {/* Live Slider & AutoSocial Button if both photos ready */}
                  {hasBothPhotos && (
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                          Preview Hasil Before/After:
                        </span>
                        <Button asChild size="sm" className="font-bold rounded-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white shadow-sm gap-1.5 text-xs">
                          <Link href={`/admin/social/new?itemId=${item.id}`}>
                            <Share2 className="w-3.5 h-3.5" /> Buat Post Multi-Channel
                          </Link>
                        </Button>
                      </div>

                      <div className="max-w-sm mx-auto">
                        <ImageComparator
                          beforeImageUrl={item.beforeImageUrl}
                          afterImageUrl={item.afterImageUrl}
                          shoeBrand={item.shoeBrand}
                          shoeModel={item.shoeModel}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Detail Pelanggan</h3>
              <ThermalReceipt order={order} triggerLabel="Cetak" />
            </div>

            <div>
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Nama Customer</span>
              <span className="font-bold text-slate-900 text-sm">{order.customerName}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Nomor WhatsApp</span>
              <span className="font-mono font-bold text-slate-800">{order.customerPhone}</span>
            </div>

            {order.customerEmail && (
              <div>
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Email</span>
                <span className="font-medium text-slate-700">{order.customerEmail}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Opsi Logistik</span>
              <div className="flex items-center gap-2 mt-1">
                {order.serviceType === "DROP_OFF" ? (
                  <>
                    <Store className="w-4 h-4 text-sky-500" />
                    <span className="font-bold text-slate-800">Drop-Off di Workshop</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-sky-500" />
                    <span className="font-bold text-slate-800">Pickup & Delivery</span>
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
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px] mb-1.5">Status Pembayaran</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={currentPaymentStatus === "PAID" ? "default" : "outline"}
                  onClick={() => handlePaymentStatusChange("PAID")}
                  className={`text-xs font-bold rounded-full h-8 ${
                    currentPaymentStatus === "PAID" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                  }`}
                >
                  Tandai Lunas
                </Button>
                <Button
                  size="sm"
                  variant={currentPaymentStatus === "UNPAID" ? "default" : "outline"}
                  onClick={() => handlePaymentStatusChange("UNPAID")}
                  className={`text-xs font-bold rounded-full h-8 ${
                    currentPaymentStatus === "UNPAID" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
                  }`}
                >
                  Belum Lunas
                </Button>
              </div>
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
