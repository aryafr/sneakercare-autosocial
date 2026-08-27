"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRecentTrackingCodes } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { FloatingNote } from "@/components/shared/ScribbleArrow";

export default function TrackSearchPage() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState("");
  const [recentCodes, setRecentCodes] = useState<Array<{ trackingCode: string; customerName: string }>>([]);

  useEffect(() => {
    getRecentTrackingCodes().then((res) => {
      if (res.success && res.data) {
        setRecentCodes(res.data);
      }
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    router.push(`/track/${trackingCode.trim().toUpperCase()}`);
  };

  return (
    <div className="container py-12 md:py-20 max-w-3xl text-center space-y-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3">
          <FloatingNote tilt="right">
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            <span>Update Status Real-Time 24/7</span>
          </FloatingNote>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Lacak Status Pengerjaan <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            Sepatu Anda
          </span>
        </h1>

        <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
          Masukkan Nomor Resi / Kode Tracking pesanan Anda untuk melihat progress pencucian, foto Before & After, dan estimasi waktu selesai.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="rounded-3xl border border-sky-100 shadow-[0_15px_45px_rgba(0,194,255,0.1)] p-5 sm:p-8 bg-white space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              required
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Contoh: SC-2026-AF7K"
              className="h-14 pl-13 pr-5 rounded-full text-base font-mono font-black uppercase tracking-wider border-slate-200 focus:border-sky-400 focus:ring-sky-400 placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-14 px-8 rounded-full font-black text-base bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white shadow-[0_10px_25px_rgba(0,194,255,0.3)] shrink-0"
          >
            Lacak Pesanan <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Dynamic Recent Tracking Suggestions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span>Resi aktif terkini di database:</span>
          {recentCodes.length > 0 ? (
            recentCodes.map((item, idx) => (
              <React.Fragment key={item.trackingCode}>
                {idx > 0 && <span>•</span>}
                <Link
                  href={`/track/${item.trackingCode}`}
                  className="font-mono font-bold text-sky-600 hover:underline"
                >
                  {item.trackingCode}
                </Link>
              </React.Fragment>
            ))
          ) : (
            <Link href="/track/SC-2026-AF7K" className="font-mono font-bold text-sky-600 hover:underline">
              SC-2026-AF7K
            </Link>
          )}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Data pelacakan terenkripsi dan dapat diakses publik tanpa login.</span>
      </div>
    </div>
  );
}
