import React from "react";
import { getCompletedItemsForSocial } from "@/actions/social";
import { MultiChannelComposer } from "@/components/social/MultiChannelComposer";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function NewSocialPostPage({
  searchParams,
}: {
  searchParams?: { itemId?: string; orderId?: string };
}) {
  const { data: items = [] } = await getCompletedItemsForSocial();
  const preselectedItemId = searchParams?.itemId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/social"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-sky-500 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Social Hub
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold font-mono uppercase tracking-wider border border-sky-100">
            Postiz Multi-Channel Composer
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-2">
          Komposer Postingan Media Sosial Lintas Platform
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Otomatisasi penggabungan visual Before & After, asisten caption AI, dan penjadwalan ke Instagram, TikTok, Facebook, & X.
        </p>
      </div>

      <MultiChannelComposer items={items as any} preselectedItemId={preselectedItemId} />
    </div>
  );
}
