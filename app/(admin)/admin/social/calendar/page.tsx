import React from "react";
import Link from "next/link";
import { getSocialCalendarPosts } from "@/actions/postiz";
import { SocialCalendarView } from "@/components/social/SocialCalendarView";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";

export const revalidate = 0;

export default async function AdminSocialCalendarPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: posts = [] } = await getSocialCalendarPosts(currentMonth, currentYear);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/social"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-sky-500 transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Social Hub
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Interactive Content Calendar
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Jadwalkan, pantau, dan atur penayangan portofolio workshop lintas platform (Postiz-Style Matrix).
          </p>
        </div>

        <Button asChild size="sm" className="font-bold rounded-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white shadow-md shadow-sky-400/20 text-xs px-5">
          <Link href="/admin/social/new">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Jadwalkan Post Baru
          </Link>
        </Button>
      </div>

      {/* Calendar Grid Component */}
      <SocialCalendarView
        initialPosts={posts as any}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  );
}
