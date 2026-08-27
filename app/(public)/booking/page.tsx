import React from "react";
import { getServices } from "@/actions/orders";
import { BookingForm } from "@/components/forms/BookingForm";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ScribbleArrow, FloatingNote } from "@/components/shared/ScribbleArrow";

export const metadata = {
  title: "Booking Layanan | homecleaning_shoes",
  description: "Formulir pemesanan laundry dan restorasi sepatu online dengan kalkulasi harga transparan.",
};

interface BookingPageProps {
  searchParams?: {
    service?: string;
  };
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const { data: servicesList = [] } = await getServices();
  const defaultServiceId = searchParams?.service;

  return (
    <div className="container py-8 md:py-12 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="space-y-4 text-left">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold font-mono uppercase tracking-wider border border-sky-100">
                Langkah Mudah Booking Online
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Formulir Pemesanan Laundry Sepatu
            </h1>
            <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
              Lengkapi informasi sepatu kesayangan Anda dan dapatkan nomor resi pelacakan instan setelah konfirmasi pembayaran.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <ScribbleArrow className="text-sky-400" />
            <FloatingNote tilt="right">
              <span>Garansi 100% Bersih & Tepat Waktu</span>
            </FloatingNote>
          </div>
        </div>
      </div>

      {/* Interactive Booking Wizard Form */}
      <BookingForm initialServices={servicesList} defaultServiceId={defaultServiceId} />
    </div>
  );
}
