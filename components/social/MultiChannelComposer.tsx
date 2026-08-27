"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createMultiChannelPost, generateAiCaptions } from "@/actions/postiz";
import { buildStitchedImageUrl } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Calendar,
  Send,
  Loader2,
  ArrowLeft,
  Instagram,
  CheckCircle2,
  Layers,
  Wand2,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CompletedItemOption {
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

interface MultiChannelComposerProps {
  items: CompletedItemOption[];
  preselectedItemId?: string;
}

type ChannelType = "INSTAGRAM" | "TIKTOK" | "FACEBOOK" | "TWITTER_X";

export function MultiChannelComposer({ items, preselectedItemId }: MultiChannelComposerProps) {
  const router = useRouter();

  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItemId || items[0]?.id || ""
  );
  const selectedItem = items.find((i) => i.id === selectedItemId);

  // Selected Channels to publish to (Postiz multi-platform selection)
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>([
    "INSTAGRAM",
    "TIKTOK",
    "FACEBOOK",
  ]);

  // Active preview channel tab
  const [activePreviewTab, setActivePreviewTab] = useState<ChannelType>("INSTAGRAM");

  // Caption state
  const defaultCaption = selectedItem
    ? `SNEAKERCARE RESTORATION REPORT\n\nSepatu ${selectedItem.shoeBrand} ${selectedItem.shoeModel} milik ${selectedItem.customerName} telah selesai menjalani treatment ${selectedItem.serviceName || "Deep Clean"} di Workshop SO CLEAN.\n\nBerikut dokumentasi perbandingan Before/After hasil pengerjaan tim teknisi kami. Dari noda membandel hingga kembali bersih dan terawat optimal.\n\nKonsultasi dan pemesanan layanan perawatan sepatu dapat diakses melalui website resmi kami.\n\n#sneakercare #shoelaundry #beforeandafter #sneakerrestoration #cucisepatu #cucisepatujakarta`
    : "";

  const [caption, setCaption] = useState(defaultCaption);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiTone, setAiTone] = useState<"PROFESSIONAL" | "VIRAL_HOOK" | "CASUAL_SNEAKERHEAD" | "PROMOTIONAL">("PROFESSIONAL");

  // Schedule DateTime state
  const defaultScheduleDate = new Date(Date.now() + 2 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
  const [scheduleDateTime, setScheduleDateTime] = useState(defaultScheduleDate);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleChannel = (channel: ChannelType) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length <= 1) {
        toast.error("Minimal pilih 1 platform tujuan");
        return;
      }
      setSelectedChannels(selectedChannels.filter((c) => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await generateAiCaptions({
        brand: selectedItem?.shoeBrand || "Nike",
        model: selectedItem?.shoeModel || "Sneaker",
        treatment: selectedItem?.serviceName || "Deep Clean Treatment",
        customerName: selectedItem?.customerName || "Customer",
        tone: aiTone,
      });

      if (res.success && res.data) {
        setCaption(res.data.caption);
        toast.success("Caption berhasil di-generate dengan AI!");
      }
    } catch (err: any) {
      toast.error("Gagal generate caption");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const stitchedUrl = selectedItem
    ? buildStitchedImageUrl({
        beforeImageUrl: selectedItem.beforeImageUrl,
        afterImageUrl: selectedItem.afterImageUrl,
        shoeBrand: selectedItem.shoeBrand,
        shoeModel: selectedItem.shoeModel,
        serviceName: selectedItem.serviceName || "Treatment",
      })
    : "";

  const handleScheduleSubmit = async () => {
    if (selectedChannels.length === 0) {
      toast.error("Pilih minimal 1 channel media sosial.");
      return;
    }

    if (!caption || caption.length < 5) {
      toast.error("Caption wajib diisi minimal 5 karakter.");
      return;
    }

    const scheduledTimestamp = Math.floor(new Date(scheduleDateTime).getTime() / 1000);
    if (scheduledTimestamp < Math.floor(Date.now() / 1000)) {
      toast.error("Waktu jadwal tidak boleh di masa lalu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createMultiChannelPost({
        orderItemId: selectedItemId || undefined,
        channels: selectedChannels,
        caption,
        scheduledAt: scheduledTimestamp,
        stitchedImageUrl: stitchedUrl,
      });

      if (res.success) {
        toast.success(`Berhasil menjadwalkan ke ${res.channelCount} channel media sosial!`);
        router.push("/admin/social/calendar");
      } else {
        throw new Error(res.error || "Gagal menjadwalkan postingan");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 7 Columns: Post Composer */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-400 hover:text-slate-700 text-xs">
            <Link href="/admin/social">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Hub
            </Link>
          </Button>
        </div>

        {/* 1. Multi-Channel Selector (Postiz Style) */}
        <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base">1. Pilih Platform Tujuan (Cross-Posting)</h3>
            <span className="text-[10px] text-sky-600 font-bold font-mono">
              {selectedChannels.length} Platform Aktif
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: "INSTAGRAM", label: "Instagram Feed", icon: Instagram, color: "text-rose-500" },
              { id: "TIKTOK", label: "TikTok Video", icon: Layers, color: "text-slate-900" },
              { id: "FACEBOOK", label: "Facebook Page", icon: Share2, color: "text-blue-600" },
              { id: "TWITTER_X", label: "X / Twitter", icon: Sparkles, color: "text-slate-900" },
            ].map((ch) => {
              const isSelected = selectedChannels.includes(ch.id as ChannelType);
              const IconComp = ch.icon;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => toggleChannel(ch.id as ChannelType)}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? "border-sky-400 bg-sky-50/60 text-slate-900 shadow-sm"
                      : "border-slate-100 text-slate-400 hover:bg-slate-50 opacity-60"
                  }`}
                >
                  <IconComp className={`w-5 h-5 ${ch.color}`} />
                  <span className="text-[11px]">{ch.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Shoe & Media Selector */}
        {items.length > 0 && (
          <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 space-y-3">
            <h3 className="font-black text-slate-900 text-base">2. Pilih Hasil Pengerjaan (Before/After)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setCaption(
                        `SNEAKERCARE RESTORATION REPORT\n\nSepatu ${item.shoeBrand} ${item.shoeModel} milik ${item.customerName} telah selesai menjalani treatment ${item.serviceName || "Deep Clean"} di Workshop SO CLEAN.\n\nBerikut dokumentasi perbandingan Before/After hasil pengerjaan tim teknisi kami. Dari noda membandel hingga kembali bersih dan terawat optimal.\n\n#sneakercare #shoelaundry #beforeandafter #sneakerrestoration`
                      );
                    }}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-sky-400 bg-sky-50/50 shadow-sm"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>{item.trackingCode}</span>
                      <Badge variant="success" className="text-[8px] px-1 py-0 rounded-full">
                        Ready
                      </Badge>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">
                      {item.shoeBrand} {item.shoeModel}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.serviceName}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. AI-Assisted Caption Composer (Postiz AI Hooks) */}
        <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-black text-slate-900 text-base">3. Tulis Caption & AI Assistant</h3>
              <p className="text-xs text-slate-400">Generate narasi viral atau laporan pengerjaan otomatis.</p>
            </div>

            {/* Tone Selector & AI Button */}
            <div className="flex items-center gap-2">
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value as any)}
                className="text-xs rounded-xl border-slate-200 font-semibold bg-slate-50 py-1.5 px-2.5"
              >
                <option value="PROFESSIONAL">Executive Report</option>
                <option value="VIRAL_HOOK">Viral Hook</option>
                <option value="CASUAL_SNEAKERHEAD">Sneakerhead Grail</option>
                <option value="PROMOTIONAL">Weekend Promo</option>
              </select>

              <Button
                type="button"
                size="sm"
                onClick={handleGenerateAi}
                disabled={isGeneratingAi}
                className="rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 text-white text-xs font-bold shadow-sm"
              >
                {isGeneratingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />}
                Generate AI
              </Button>
            </div>
          </div>

          <Textarea
            rows={7}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Tulis caption promosi portofolio..."
            className="text-xs font-sans leading-relaxed rounded-2xl border-slate-200 resize-none"
          />

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{caption.length} Karakter</span>
            <span className="text-sky-600 font-bold">Auto-stitched 1080x1080px format</span>
          </div>
        </div>

        {/* 4. Scheduling Time & Dispatch */}
        <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-base">4. Jadwal Penayangan (Edge Cron)</h3>

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

          <Button
            type="button"
            size="lg"
            disabled={isSubmitting}
            onClick={handleScheduleSubmit}
            className="w-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-black text-sm rounded-full shadow-[0_10px_25px_rgba(0,194,255,0.3)] h-13"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menjadwalkan Postingan...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" /> Jadwalkan ke {selectedChannels.length} Channel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right 5 Columns: Live Device Mockup Preview */}
      <div className="lg:col-span-5 space-y-4 sticky top-24">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" /> Live Platform Preview
          </h3>

          {/* Platform Preview Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {["INSTAGRAM", "TIKTOK", "FACEBOOK", "TWITTER_X"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePreviewTab(tab as ChannelType)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  activePreviewTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {tab === "INSTAGRAM" ? "IG" : tab === "TIKTOK" ? "TT" : tab === "FACEBOOK" ? "FB" : "X"}
              </button>
            ))}
          </div>
        </div>

        {/* Instagram Preview Mockup Card */}
        <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-xl bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-rose-500" />
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">@sneakercare.official</div>
                <div className="text-[10px] text-slate-400">SneakerCare Workshop ID</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-sky-500 font-bold">{activePreviewTab}</span>
          </div>

          {/* 1:1 Stitched Feed Image */}
          <div className="relative w-full aspect-square bg-slate-900 overflow-hidden">
            {stitchedUrl ? (
              <Image
                src={stitchedUrl}
                alt="Before & After Preview"
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 450px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                Foto Belum Dipilih
              </div>
            )}
          </div>

          {/* Action icons */}
          <div className="p-3.5 space-y-2">
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 hover:text-rose-500 cursor-pointer" />
                <MessageCircle className="w-5 h-5 hover:text-sky-500 cursor-pointer" />
                <Share2 className="w-5 h-5 hover:text-sky-500 cursor-pointer" />
              </div>
              <Bookmark className="w-5 h-5 hover:text-sky-500 cursor-pointer" />
            </div>

            <div className="text-xs font-bold text-slate-900">248 likes</div>

            <div className="text-xs leading-relaxed">
              <span className="font-bold text-slate-900 mr-1.5">@sneakercare.official</span>
              <span className="whitespace-pre-line text-slate-600">{caption}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
