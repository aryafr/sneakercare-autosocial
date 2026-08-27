"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createScheduledPost, executePublishPost } from "@/actions/social";
import { buildStitchedImageUrl } from "@/lib/cloudinary";
import { StitchedPreview } from "@/components/shared/StitchedPreview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Send, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface SocialItemOption {
  id: string;
  orderId: string;
  shoeBrand: string;
  shoeModel: string;
  shoeColor?: string | null;
  serviceName?: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
  customerName: string;
  trackingCode: string;
}

interface SocialScheduleFormProps {
  items: SocialItemOption[];
  preselectedItemId?: string;
}

export function SocialScheduleForm({ items, preselectedItemId }: SocialScheduleFormProps) {
  const router = useRouter();

  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItemId || items[0]?.id || ""
  );

  const selectedItem = items.find((i) => i.id === selectedItemId);

  // Generate initial caption template (clean, professional copywriting)
  const generateDefaultCaption = (item?: SocialItemOption) => {
    if (!item) return "";
    return `SNEAKERCARE RESTORATION REPORT\n\nSepatu ${item.shoeBrand} ${item.shoeModel} milik ${item.customerName} telah selesai menjalani treatment ${item.serviceName || "Deep Clean"} di Workshop SneakerCare.\n\nBerikut dokumentasi perbandingan Before/After hasil pengerjaan tim teknisi kami. Dari noda membandel hingga kembali bersih dan terawat optimal.\n\nKonsultasi dan pemesanan layanan perawatan sepatu dapat diakses melalui website resmi kami.\n\n#sneakercare #shoelaundry #beforeandafter #sneakerrestoration #cucisepatu #cucisepatujakarta`;
  };

  const [caption, setCaption] = useState(generateDefaultCaption(selectedItem));

  // Date and Time state (default: 2 hours from now)
  const defaultScheduleDate = new Date(Date.now() + 2 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
  const [scheduleDateTime, setScheduleDateTime] = useState(defaultScheduleDate);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishingNow, setIsPublishingNow] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setCaption(generateDefaultCaption(selectedItem));
    }
  }, [selectedItemId]);

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-sky-100 bg-white p-12 text-center max-w-lg mx-auto shadow-sm">
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-900">Belum Ada Sepatu Siap Publikasi</h3>
        <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
          Untuk menjadwalkan postingan Instagram, operator perlu mengunggah kedua foto Before dan After pada detail pesanan.
        </p>
        <Button asChild className="rounded-full bg-sky-500 hover:bg-sky-600 font-bold text-xs">
          <Link href="/admin/dashboard">Buka Workshop Board</Link>
        </Button>
      </div>
    );
  }

  const stitchedUrl = selectedItem
    ? buildStitchedImageUrl({
        beforeImageUrl: selectedItem.beforeImageUrl,
        afterImageUrl: selectedItem.afterImageUrl,
        shoeBrand: selectedItem.shoeBrand,
        shoeModel: selectedItem.shoeModel,
        serviceName: selectedItem.serviceName || "Treatment",
      })
    : "";

  const handleSchedule = async (publishNow: boolean = false) => {
    if (!selectedItemId) {
      toast.error("Pilih sepatu terlebih dahulu.");
      return;
    }

    if (!caption || caption.length < 5) {
      toast.error("Caption wajib diisi minimal 5 karakter.");
      return;
    }

    const scheduledTimestamp = Math.floor(new Date(scheduleDateTime).getTime() / 1000);

    if (!publishNow && scheduledTimestamp < Math.floor(Date.now() / 1000)) {
      toast.error("Waktu jadwal tidak boleh di masa lalu.");
      return;
    }

    if (publishNow) {
      setIsPublishingNow(true);
    } else {
      setIsSubmitting(true);
    }

    try {
      const res = await createScheduledPost({
        orderItemId: selectedItemId,
        channels: ["INSTAGRAM"],
        caption,
        scheduledAt: publishNow ? Math.floor(Date.now() / 1000) : scheduledTimestamp,
      });

      if (!res.success || !res.postId) {
        throw new Error(res.error || "Gagal menjadwalkan postingan.");
      }

      if (publishNow) {
        const pubRes = await executePublishPost(res.postId);
        if (!pubRes.success) {
          throw new Error(pubRes.error || "Gagal menerbitkan ke Instagram.");
        }
        toast.success("Postingan berhasil diterbitkan ke Instagram!");
      } else {
        toast.success("Postingan berhasil dijadwalkan ke antrean QStash!");
      }

      router.push("/admin/social");
    } catch (err: any) {
      console.error("Social schedule error:", err);
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
      setIsPublishingNow(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form Controls */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-400 hover:text-slate-700 text-xs">
            <Link href="/admin/social">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>
          </Button>
        </div>

        {/* 1. Item Selector */}
        <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 space-y-4">
          <div>
            <h3 className="font-black text-slate-900 text-base">1. Pilih Sepatu (Before/After Siap)</h3>
            <p className="text-xs text-slate-400">Pilih hasil pengerjaan workshop yang telah memiliki foto Before & After lengkap.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => {
              const isSelected = item.id === selectedItemId;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-sky-400 bg-sky-50/50 shadow-sm"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                      <span>{item.trackingCode}</span>
                      <Badge variant="success" className="text-[9px] px-1.5 py-0 rounded-full">
                        Siap Tayang
                      </Badge>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {item.shoeBrand} {item.shoeModel}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.serviceName} • {item.customerName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Caption Editor */}
        <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 space-y-3">
          <div>
            <h3 className="font-black text-slate-900 text-base">2. Edit Caption & Hashtags</h3>
            <p className="text-xs text-slate-400">Sesuaikan narasi promosi sebelum otomatis dipublikasikan ke Instagram Feed.</p>
          </div>

          <Textarea
            rows={7}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Tulis caption Instagram menarik..."
            className="text-xs font-sans leading-relaxed rounded-2xl border-slate-200 resize-none"
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{caption.length} karakter</span>
            <span className="text-sky-600 font-bold">Auto-stitched 1080x1080px format</span>
          </div>
        </div>

        {/* 3. Schedule Time */}
        <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 space-y-4">
          <div>
            <h3 className="font-black text-slate-900 text-base">3. Waktu Penayangan (Edge Cron)</h3>
            <p className="text-xs text-slate-400">Tentukan jadwal publishing atau terbitkan secara instan saat ini juga.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-500" /> JADWAL TANGGAL & JAM PUBLISH
            </label>
            <Input
              type="datetime-local"
              value={scheduleDateTime}
              onChange={(e) => setScheduleDateTime(e.target.value)}
              className="font-mono text-xs rounded-2xl border-slate-200"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSubmitting || isPublishingNow}
              onClick={() => handleSchedule(true)}
              className="flex-1 font-bold rounded-full border-sky-200 text-sky-600 hover:bg-sky-50 text-xs"
            >
              {isPublishingNow ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menerbitkan...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Terbitkan Sekarang (Publish Now)
                </>
              )}
            </Button>

            <Button
              type="button"
              size="lg"
              disabled={isSubmitting || isPublishingNow}
              onClick={() => handleSchedule(false)}
              className="flex-1 font-black rounded-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white shadow-md shadow-sky-400/25 text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menjadwalkan...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" /> Jadwalkan ke QStash Queue
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Live Instagram Mockup Preview */}
      <div className="lg:col-span-5 space-y-4">
        <div className="sticky top-20">
          <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500" /> Live Instagram Preview
          </h3>
          {stitchedUrl && (
            <StitchedPreview
              stitchedImageUrl={stitchedUrl}
              caption={caption}
              accountName="@sneakercare.official"
            />
          )}
        </div>
      </div>
    </div>
  );
}
