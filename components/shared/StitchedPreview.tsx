import React from "react";
import Image from "next/image";
import { Heart, MessageCircle, Send, Bookmark, Instagram } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StitchedPreviewProps {
  stitchedImageUrl: string;
  caption: string;
  accountName?: string;
}

export function StitchedPreview({
  stitchedImageUrl,
  caption,
  accountName = "@sneakercare.official",
}: StitchedPreviewProps) {
  return (
    <Card className="max-w-md w-full mx-auto overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl">
      {/* Instagram Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center">
              <Instagram className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">{accountName}</div>
            <div className="text-[10px] text-muted-foreground">SneakerCare Workshop</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-mono">Sponsored • Autopost</div>
      </div>

      {/* 1:1 Stitched Feed Image */}
      <div className="relative w-full aspect-square bg-slate-900 overflow-hidden">
        <Image
          src={stitchedImageUrl}
          alt="Before & After Instagram Post"
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 450px"
          priority
        />
      </div>

      {/* Action Bar */}
      <div className="p-3.5 space-y-2">
        <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 hover:text-rose-500 cursor-pointer transition-colors" />
            <MessageCircle className="w-6 h-6 hover:text-primary cursor-pointer transition-colors" />
            <Send className="w-6 h-6 hover:text-primary cursor-pointer transition-colors" />
          </div>
          <Bookmark className="w-6 h-6 hover:text-primary cursor-pointer transition-colors" />
        </div>

        <div className="text-xs font-bold">128 likes</div>

        {/* Caption */}
        <div className="text-xs leading-relaxed">
          <span className="font-bold mr-1.5">{accountName}</span>
          <span className="whitespace-pre-line text-slate-700 dark:text-slate-300">{caption}</span>
        </div>
      </div>
    </Card>
  );
}
