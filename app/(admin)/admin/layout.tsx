import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Bell } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b bg-card px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h1 className="font-black text-sm text-foreground uppercase tracking-wider">
              Workshop Management OS
            </h1>
            <Badge variant="success" className="font-mono text-[10px] uppercase">
              Online • Cloudflare Edge
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                AD
              </div>
              <div className="hidden sm:block">
                <span className="font-bold block text-foreground leading-tight">Workshop Owner</span>
                <span className="text-[10px] text-muted-foreground font-mono">Role: Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Admin Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
