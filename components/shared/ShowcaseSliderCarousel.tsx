"use client";

import React, { useState } from "react";
import { ImageComparator } from "./ImageComparator";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ShowcaseItem {
  id: string;
  brand: string;
  model: string;
  treatment?: string | null;
  note?: string | null;
  beforeImage: string;
  afterImage: string;
}

const DEFAULT_SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "showcase-1",
    brand: "Off-White x Nike",
    model: "Blazer Mid 'Grim Reaper' High",
    treatment: "Deep Clean + Midsole De-Oxidation",
    note: "Sepatu Off-White & High-End Branded",
    beforeImage: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "showcase-2",
    brand: "Adidas",
    model: "Yeezy Boost 350 V2 Cream",
    treatment: "Unyellowing Sole + Primeknit Wash",
    note: "Penghilangan Noda Kuning Oksidasi",
    beforeImage: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "showcase-3",
    brand: "Converse",
    model: "Chuck 70 Vintage Canvas High",
    treatment: "Color Repaint + Outsole Whitening",
    note: "Pengecatan Ulang Warna Pudar",
    beforeImage: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=800&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  },
];

interface ShowcaseSliderCarouselProps {
  items?: ShowcaseItem[];
}

export function ShowcaseSliderCarousel({ items }: ShowcaseSliderCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayItems = items && items.length > 0 ? items : DEFAULT_SHOWCASE_ITEMS;
  const currentItem = displayItems[currentIndex] || displayItems[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayItems.length - 1 ? 0 : prev + 1));
  };

  if (!currentItem) return null;

  return (
    <div className="relative max-w-4xl mx-auto space-y-6">
      {/* Interactive Slider Box */}
      <div className="relative flex items-center justify-center">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          aria-label="Previous Showcase"
          className="absolute -left-4 sm:-left-6 z-30 w-12 h-12 rounded-full bg-white shadow-xl border border-sky-100 flex items-center justify-center text-slate-700 hover:text-sky-500 hover:scale-110 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center Comparator Card */}
        <div className="w-full max-w-2xl bg-white p-3 sm:p-4 rounded-3xl border border-sky-100 shadow-[0_15px_50px_rgba(0,194,255,0.12)] relative">
          <ImageComparator
            beforeImageUrl={currentItem.beforeImage}
            afterImageUrl={currentItem.afterImage}
            shoeBrand={currentItem.brand}
            shoeModel={currentItem.model}
          />
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          aria-label="Next Showcase"
          className="absolute -right-4 sm:-right-6 z-30 w-12 h-12 rounded-full bg-white shadow-xl border border-sky-100 flex items-center justify-center text-slate-700 hover:text-sky-500 hover:scale-110 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Showcase Indicator & Caption */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 px-2 text-center sm:text-left">
        <div>
          <h4 className="font-black text-slate-900 text-lg">
            {currentItem.brand} {currentItem.model}
          </h4>
          <p className="text-xs text-sky-600 font-semibold font-mono">
            Treatment: {currentItem.treatment || "Sneaker Restoration"}
          </p>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center gap-2">
          {displayItems.map((item, idx) => (
            <button
              key={item.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentIndex ? "w-8 bg-sky-500" : "w-2.5 bg-slate-200"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
