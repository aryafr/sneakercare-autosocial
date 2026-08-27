"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, ChevronsLeftRight } from "lucide-react";

interface ImageComparatorProps {
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  shoeBrand?: string;
  shoeModel?: string;
}

export function ImageComparator({
  beforeImageUrl,
  afterImageUrl,
  shoeBrand = "Sneaker",
  shoeModel = "Care",
}: ImageComparatorProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.touches[0].clientX, rect);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX, rect);
  };

  if (!beforeImageUrl && !afterImageUrl) {
    return (
      <div className="w-full aspect-square rounded-2xl bg-muted/50 border border-dashed flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <Sparkles className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">Foto Before & After belum diunggah.</p>
        <p className="text-xs opacity-75">Operator akan mengunggah foto saat pengerjaan berlangsung.</p>
      </div>
    );
  }

  // If only one image is available
  if (!beforeImageUrl || !afterImageUrl) {
    const singleImage = beforeImageUrl || afterImageUrl;
    const label = beforeImageUrl ? "Foto Saat Diterima (Before)" : "Foto Selesai (After)";
    return (
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border shadow-sm group">
        <Image
          src={singleImage!}
          alt={`${shoeBrand} ${shoeModel}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 500px"
        />
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-square rounded-2xl overflow-hidden select-none cursor-ew-resize border shadow-md"
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Background (AFTER image) */}
      <Image
        src={afterImageUrl}
        alt={`After: ${shoeBrand} ${shoeModel}`}
        fill
        className="object-cover pointer-events-none"
        sizes="(max-width: 768px) 100vw, 500px"
        priority
      />
      <div className="absolute top-4 right-4 bg-emerald-600/90 text-white font-mono text-xs font-black px-3 py-1 rounded-md shadow-sm z-10">
        AFTER
      </div>

      {/* Foreground Clipped (BEFORE image) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="relative w-full h-full" style={{ width: `calc(100% * 100 / ${sliderPosition})` }}>
          <Image
            src={beforeImageUrl}
            alt={`Before: ${shoeBrand} ${shoeModel}`}
            fill
            className="object-cover pointer-events-none"
            sizes="(max-width: 768px) 100vw, 500px"
            priority
          />
        </div>
        <div className="absolute top-4 left-4 bg-red-600/90 text-white font-mono text-xs font-black px-3 py-1 rounded-md shadow-sm z-10">
          BEFORE
        </div>
      </div>

      {/* Slider Line & Handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-slate-800 rounded-full shadow-lg flex items-center justify-center border border-slate-200">
          <ChevronsLeftRight className="w-4 h-4 text-slate-700" />
        </div>
      </div>
    </div>
  );
}
