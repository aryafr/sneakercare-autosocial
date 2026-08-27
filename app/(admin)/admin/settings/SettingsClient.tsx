"use client";

import React, { useState } from "react";
import { SocialAccount, SocialTemplate } from "@/db/schema";
import { toggleSocialAccountStatus } from "@/actions/settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  Instagram,
  Facebook,
  Twitter,
  Video,
  Hash,
  Link as LinkIcon,
  Unlink,
  MessageSquarePlus,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SettingsClientProps {
  initialAccounts: SocialAccount[];
  initialTemplates: SocialTemplate[];
}

export function SettingsClient({ initialAccounts, initialTemplates }: SettingsClientProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsLoading(id);
    const result = await toggleSocialAccountStatus(id, currentStatus);
    
    if (result.success) {
      toast.success(currentStatus ? "Akun berhasil diputus." : "Akun berhasil dihubungkan kembali.");
      setAccounts(accounts.map(acc => acc.id === id ? { ...acc, isActive: !currentStatus } : acc));
    } else {
      toast.error(result.error || "Gagal mengubah status akun");
    }
    setIsLoading(null);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "INSTAGRAM": return <Instagram className="w-5 h-5 text-pink-600" />;
      case "TIKTOK": return <Video className="w-5 h-5 text-slate-900" />;
      case "FACEBOOK": return <Facebook className="w-5 h-5 text-blue-600" />;
      case "TWITTER_X": return <Twitter className="w-5 h-5 text-slate-800" />;
      default: return <LinkIcon className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Pengaturan & Integrasi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola koneksi akun sosial media dan preferensi Auto-Caption AI.
          </p>
        </div>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="accounts" className="text-xs font-bold gap-2">
            <LinkIcon className="w-4 h-4" /> Integrasi Akun
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs font-bold gap-2">
            <MessageSquarePlus className="w-4 h-4" /> Template AI Prompt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {getPlatformIcon(acc.platform)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{acc.platform}</h3>
                      <p className="text-xs font-medium text-slate-500">{acc.accountName}</p>
                    </div>
                  </div>
                  <Badge variant={acc.isActive ? "default" : "secondary"} className={cn("text-[10px]", acc.isActive ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50" : "")}>
                    {acc.isActive ? "Terhubung" : "Terputus"}
                  </Badge>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button
                    variant={acc.isActive ? "outline" : "default"}
                    size="sm"
                    className={cn("w-full text-xs font-bold rounded-xl", acc.isActive ? "text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100" : "bg-sky-500 hover:bg-sky-600 text-white")}
                    onClick={() => handleToggleStatus(acc.id, acc.isActive)}
                    disabled={isLoading === acc.id}
                  >
                    {isLoading === acc.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : acc.isActive ? (
                      <>
                        <Unlink className="w-4 h-4 mr-2" /> Putuskan Koneksi
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" /> Hubungkan Ulang
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {initialTemplates.map((template) => (
              <div key={template.id} className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-sky-500" />
                    {template.title}
                  </h3>
                  <Badge variant="outline" className="text-[10px]">{template.category}</Badge>
                </div>
                
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instruksi AI (Hook)</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{template.promptHook}"
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format Caption</span>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {template.templateBody}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-start gap-2">
                    <Hash className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-sky-600 leading-relaxed">
                      {template.hashtags}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
