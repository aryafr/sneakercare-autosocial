import React from "react";
import Link from "next/link";
import { getSocialPostsList, getOrCreateDefaultSocialAccount } from "@/actions/social";
import { getSocialChannels } from "@/actions/postiz";
import { formatDateTime } from "@/lib/utils";
import { SocialStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Instagram,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Sparkles,
  Layers,
} from "lucide-react";
import Image from "next/image";

export const revalidate = 0;

export default async function AdminSocialDashboardPage() {
  const { data: posts = [] } = await getSocialPostsList();
  const { data: channels = [] } = await getSocialChannels();

  const scheduledPosts = posts.filter((p) => p.status === "SCHEDULED" || p.status === "PUBLISHING");
  const publishedPosts = posts.filter((p) => p.status === "PUBLISHED");
  const failedPosts = posts.filter((p) => p.status === "FAILED");

  return (
    <div className="space-y-8">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Postiz Auto-Social Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Otomasi kompilasi visual Before/After dan antrean postingan ke Instagram, TikTok, Facebook, & X via Edge Cron (QStash).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="font-bold rounded-full border-slate-200 text-xs px-4">
            <Link href="/admin/social/calendar">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-sky-500" /> Buka Kalender Konten
            </Link>
          </Button>

          <Button asChild size="sm" className="font-bold rounded-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white shadow-md shadow-sky-400/20 text-xs px-5">
            <Link href="/admin/social/new">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Buat Postingan Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Connected Channels Matrix (Postiz-Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className="rounded-3xl bg-white border border-sky-100 p-5 shadow-[0_10px_30px_rgba(0,194,255,0.06)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
                {ch.platform === "INSTAGRAM" ? (
                  <Instagram className="w-5 h-5 text-rose-500" />
                ) : ch.platform === "TIKTOK" ? (
                  <Layers className="w-5 h-5 text-slate-900" />
                ) : ch.platform === "FACEBOOK" ? (
                  <Share2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <Sparkles className="w-5 h-5 text-slate-900" />
                )}
              </div>
              <Badge variant="success" className="text-[9px] px-2 py-0.5 rounded-full font-mono">
                Active
              </Badge>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">{ch.platform}</span>
              <h4 className="font-bold text-sm text-slate-900">{ch.accountName}</h4>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Auto-Publish Edge</span>
              <span className="text-sky-600 font-bold">Enabled</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Queue Summary */}
      <div className="rounded-3xl bg-white border border-sky-100 p-6 shadow-[0_10px_35px_rgba(0,194,255,0.06)]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" /> Multi-Channel Queue Summary
            </h3>
            <p className="text-xs text-slate-400">Status antrean penayangan portofolio workshop.</p>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-full text-xs font-bold border-slate-200">
            <Link href="/admin/social/calendar">Lihat Tampilan Kalender</Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center py-4">
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
            <span className="text-[10px] font-bold text-sky-600 block uppercase tracking-wider">Antrean Terjadwal</span>
            <span className="text-3xl font-black font-mono text-sky-700">{scheduledPosts.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wider">Berhasil Terbit</span>
            <span className="text-3xl font-black font-mono text-emerald-700">{publishedPosts.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
            <span className="text-[10px] font-bold text-red-600 block uppercase tracking-wider">Perlu Perhatian</span>
            <span className="text-3xl font-black font-mono text-red-700">{failedPosts.length}</span>
          </div>
        </div>
      </div>

      {/* 4. Social Posts Queue Table */}
      <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-base">Daftar Konten Portofolio</h3>
            <p className="text-xs text-slate-400">Semua postingan Before-After yang dijadwalkan dan telah dipublikasikan.</p>
          </div>
          <Button asChild size="sm" variant="outline" className="text-xs rounded-full font-bold border-slate-200">
            <Link href="/admin/social/new">
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Buat Baru
            </Link>
          </Button>
        </div>

        <div>
          {posts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Share2 className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-medium">Belum ada postingan dijadwalkan.</p>
              <Button asChild size="sm" className="rounded-full bg-sky-500 text-white">
                <Link href="/admin/social/new">Buat Post Pertama</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/70 text-slate-400 uppercase font-bold border-b border-slate-100 text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Preview Stitched (1:1)</th>
                    <th className="px-6 py-3.5">Sepatu & Layanan</th>
                    <th className="px-6 py-3.5">Caption & Narasi</th>
                    <th className="px-6 py-3.5">Jadwal Publish</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">QStash ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0">
                          <Image
                            src={post.stitchedImageUrl}
                            alt="Stitched Preview"
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {post.shoeBrand || "Sneaker"} {post.shoeModel}
                        </div>
                        <span className="text-slate-400">{post.serviceName || "Treatment"}</span>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-600 leading-relaxed text-xs">
                          {post.caption}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {formatDateTime(post.scheduledAt)}
                        {post.publishedAt && (
                          <span className="block text-[10px] text-emerald-600 font-sans mt-0.5 font-bold">
                            Terbit: {formatDateTime(post.publishedAt)}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <SocialStatusBadge status={post.status} />
                        {post.errorMessage && (
                          <span className="block text-[10px] text-red-500 mt-1 font-mono">
                            {post.errorMessage}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right font-mono text-[11px] text-slate-400">
                        {post.qstashMessageId ? (
                          <span title={post.qstashMessageId} className="underline cursor-help">
                            {post.qstashMessageId.substring(0, 10)}...
                          </span>
                        ) : (
                          "-"
                        )}
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
