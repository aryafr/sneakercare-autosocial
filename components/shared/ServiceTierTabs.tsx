"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { type Service } from "@/db/schema";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ArrowRight, Sparkles, Droplets, ShieldCheck, Zap } from "lucide-react";

interface ServiceTierTabsProps {
  services: Service[];
}

interface ServiceDetailMeta {
  code: string;
  category: string;
  image: string;
  includes: string[];
  turnaround: string;
  expressAvailable: boolean;
}

const SERVICE_META: Record<string, ServiceDetailMeta> = {
  serv_deep_clean: {
    code: "01 DEEP CLEAN",
    category: "Paling Populer",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    includes: [
      "Pembersihan menyeluruh bagian Upper, Midsole, Outsole",
      "Pencucian Insole & Tali Sepatu (Laces)",
      "Treatment Anti-Bakteri & Penghilang Bau Apek",
      "Pengeringan Higienis dengan Suhu Terkontrol",
      "Quality Control 3 Tahap",
    ],
    turnaround: "2-3 Hari Kerja",
    expressAvailable: true,
  },
  serv_fast_clean: {
    code: "02 FAST CLEAN",
    category: "Perawatan Kilat",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    includes: [
      "Pembersihan cepat kotoran debu permukaan Upper",
      "Pembersihan noda ringan pada Midsole samping",
      "Semprotan Disinfektan & Parfum Sepatu",
      "Siap pakai dalam waktu cepat",
    ],
    turnaround: "1 Hari Kerja (Selesai Hari Yang Sama)",
    expressAvailable: false,
  },
  serv_unyellowing: {
    code: "03 UNYELLOWING",
    category: "Spesialis Midsole",
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop",
    includes: [
      "Penghilangan noda kuning oksidasi pada karet sol",
      "Aplikasi formula UV activator khusus tanpa merusak karet",
      "Pembersihan menyeluruh seluruh bagian sepatu",
      "Lapisan proteksi anti-oksidasi jangka panjang",
    ],
    turnaround: "3-4 Hari Kerja",
    expressAvailable: true,
  },
  serv_repaint: {
    code: "04 REPAINT & RESTORASI",
    category: "Restorasi Warna",
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=800&auto=format&fit=crop",
    includes: [
      "Pengecatan ulang presisi mengembalikan warna asli",
      "Pilihan custom colorway atau touch-up baret",
      "Finishing coat anti-luntur & waterproof",
      "Pembersihan deep clean sebelum pengerjaan cat",
    ],
    turnaround: "4-5 Hari Kerja",
    expressAvailable: false,
  },
  serv_leather: {
    code: "05 LEATHER & SUEDE",
    category: "Bahan Premium",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    includes: [
      "Pembersihan khusus dengan chemical pH netral",
      "Mink oil / Leather conditioner wax agar kulit tidak retak",
      "Penyisiran serat halus material suede & nubuck",
      "Lapisan pelindung water repellent",
    ],
    turnaround: "3 Hari Kerja",
    expressAvailable: true,
  },
  serv_suede: {
    code: "06 SUEDE CARE",
    category: "Material Sensitif",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop",
    includes: [
      "Metode dry cleaning khusus bahan suede",
      "Penyisiran serat nubuck dengan sikat kawat kuningan",
      "Penghilangan noda air tanpa meninggalkan bercak",
      "Aplikasi spray pelindung hydrophobic",
    ],
    turnaround: "3 Hari Kerja",
    expressAvailable: true,
  },
};

export function ServiceTierTabs({ services }: ServiceTierTabsProps) {
  const [activeId, setActiveId] = useState<string>(services[0]?.id || "serv_deep_clean");

  const currentService = services.find((s) => s.id === activeId) || services[0];
  const meta = SERVICE_META[activeId] || SERVICE_META["serv_deep_clean"];

  return (
    <div className="space-y-8">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none justify-start md:justify-center">
        {services.map((service) => {
          const isActive = service.id === activeId;
          return (
            <button
              key={service.id}
              onClick={() => setActiveId(service.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-sky-400 text-white shadow-md shadow-sky-400/30 scale-105"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {service.name}
            </button>
          );
        })}
      </div>

      {/* Expanded Tier Detail Card */}
      {currentService && (
        <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_40px_rgba(0,194,255,0.08)] p-6 sm:p-10 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Visual Image */}
            <div className="lg:col-span-5 relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 shadow-md group">
              <Image
                src={meta.image}
                alt={currentService.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 450px"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-sky-600 uppercase tracking-wider border border-sky-100">
                {meta.category}
              </div>
            </div>

            {/* Right Column: Treatment Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-sky-500 uppercase tracking-widest block">
                  {meta.code}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {currentService.name}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed pt-1">
                  {currentService.description}
                </p>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Column 1: Apa yang masuk? */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase text-slate-900 tracking-wider block">
                    Apa yang dikerjakan?
                  </span>
                  <ul className="space-y-2">
                    {meta.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Estimasi Waktu & Harga */}
                <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase text-slate-900 tracking-wider block">
                      Estimasi Pengerjaan
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                      <Clock className="w-4 h-4 text-sky-500" />
                      <span>{meta.turnaround}</span>
                    </div>
                    {meta.expressAvailable && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg w-fit border border-amber-200">
                        <Zap className="w-3 h-3" />
                        <span>Tersedia Opsi Express (1 Hari)</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-400 block font-medium">Biaya Mulai Dari</span>
                    <div className="text-2xl font-black font-mono text-sky-600">
                      {formatRupiah(currentService.basePrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-bold rounded-full px-8 shadow-lg shadow-sky-400/25 h-12">
                  <Link href={`/booking?service=${currentService.id}`}>
                    Booking Layanan Ini <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 h-12">
                  <Link href="/track">
                    Cek Status Pesanan
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
