"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Plus,
  Sparkles,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface CalendarPost {
  id: string;
  channelType: string;
  stitchedImageUrl: string;
  caption: string;
  scheduledAt: Date;
  publishedAt?: Date | null;
  status: string;
  accountName?: string | null;
  shoeBrand?: string | null;
  shoeModel?: string | null;
}

interface SocialCalendarViewProps {
  initialPosts: CalendarPost[];
  currentMonth: number;
  currentYear: number;
}

export function SocialCalendarView({
  initialPosts,
  currentMonth: initialMonth,
  currentYear: initialYear,
}: SocialCalendarViewProps) {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Build calendar matrix
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sunday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const filteredPosts = initialPosts.filter((p) => {
    if (selectedChannel === "ALL") return true;
    return p.channelType === selectedChannel;
  });

  const getPostsForDay = (day: number) => {
    return filteredPosts.filter((p) => {
      const pDate = new Date(p.scheduledAt);
      return pDate.getDate() === day && pDate.getMonth() + 1 === month && pDate.getFullYear() === year;
    });
  };

  const renderPlatformIcon = (channel: string) => {
    switch (channel) {
      case "TIKTOK":
        return <span className="font-bold text-[10px] text-slate-900 bg-white px-1 rounded">TT</span>;
      case "FACEBOOK":
        return <span className="font-bold text-[10px] text-blue-600 bg-white px-1 rounded">FB</span>;
      case "TWITTER_X":
        return <span className="font-bold text-[10px] text-slate-900 bg-white px-1 rounded">X</span>;
      default:
        return <Instagram className="w-3 h-3 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-black text-sm text-slate-900 px-3 font-mono">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Channel Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["ALL", "INSTAGRAM", "TIKTOK", "FACEBOOK", "TWITTER_X"].map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedChannel === ch
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {ch === "ALL" ? "Semua Channel" : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <div>Min</div>
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div>Sab</div>
        </div>

        {/* Calendar Matrix Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {/* Blank prefix days */}
          {blankDays.map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[120px] bg-slate-50/30 p-2" />
          ))}

          {/* Month days */}
          {daysArray.map((day) => {
            const dayPosts = getPostsForDay(day);
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() + 1 &&
              year === new Date().getFullYear();

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[120px] p-2.5 transition-colors flex flex-col justify-between group hover:bg-sky-50/20 ${
                  isToday ? "bg-sky-50/40" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                      isToday ? "bg-sky-500 text-white shadow-sm" : "text-slate-700"
                    }`}
                  >
                    {day}
                  </span>
                  <Link
                    href={`/admin/social/new?date=${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-sky-500"
                    title="Tambah Post di Tanggal Ini"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Scheduled Posts on this day */}
                <div className="space-y-1.5 flex-1">
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-1.5 rounded-xl border border-sky-100 bg-white shadow-sm text-[10px] space-y-1 hover:border-sky-300 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {renderPlatformIcon(post.channelType)}
                          <span className="font-bold text-slate-800 uppercase text-[9px]">
                            {post.channelType}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-slate-400">
                          {new Date(post.scheduledAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="line-clamp-1 text-slate-600 text-[10px] leading-tight">
                        {post.caption}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
