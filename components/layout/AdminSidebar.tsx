"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Share2,
  Sparkles,
  LogOut,
  ExternalLink,
  PlusCircle,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NAV_ITEMS = [
  {
    label: "Workshop Board",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Antrean & Upload",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    label: "Kalender Konten",
    href: "/admin/social/calendar",
    icon: Calendar,
  },
  {
    label: "Auto-Social Hub",
    href: "/admin/social",
    icon: Share2,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "better-auth.session_token=; Max-Age=0; path=/;";
    toast.success("Berhasil keluar.");
    router.push("/login");
  };

  return (
    <aside className="w-64 border-r border-slate-100 bg-white h-screen sticky top-0 flex flex-col justify-between p-4 shrink-0 shadow-sm">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-sky-400/20 border border-sky-100 bg-white relative shrink-0">
            <Image
              src="/logo.png"
              alt="homecleaning_shoes Logo"
              fill
              className="object-cover scale-110"
            />
          </div>
          <div>
            <div className="flex items-baseline font-mono font-black text-sm tracking-tight">
              <span className="text-slate-900">homecleaning</span>
              <span className="text-sky-500">_shoes</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">WORKSHOP OS v1.0</p>
          </div>
        </div>

        {/* Action Button */}
        <Button asChild className="w-full justify-start gap-2 rounded-full font-bold bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white shadow-md shadow-sky-400/20 text-xs">
          <Link href="/admin/social/new">
            <PlusCircle className="w-4 h-4" />
            <span>Buat Post Multi-Channel</span>
          </Link>
        </Button>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                item.href !== "/admin/social" &&
                pathname.startsWith(item.href + "/"));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all",
                  isActive
                    ? "bg-sky-50 text-sky-600 shadow-sm border border-sky-100 font-black"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-400 hover:text-slate-700 text-xs rounded-xl">
          <Link href="/" target="_blank">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Website Publik</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs rounded-xl border-slate-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar dari Admin</span>
        </Button>
      </div>
    </aside>
  );
}
