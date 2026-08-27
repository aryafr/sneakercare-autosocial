"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Lock, Mail, Loader2, ArrowLeft, ShieldCheck, Waves } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@sneakercare.local");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Set session cookie for local and edge middleware
      document.cookie = "better-auth.session_token=mock_session_active; path=/; max-age=86400;";
      toast.success("Login berhasil! Selamat datang kembali.");
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk. Periksa email dan password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white relative overflow-hidden">
      {/* Subtle Cyan Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Website Publik
        </Link>

        <div className="rounded-3xl border border-sky-100 shadow-[0_20px_50px_rgba(0,194,255,0.1)] bg-white p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 via-cyan-400 to-blue-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-sky-400/30">
              <Waves className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Portal Admin Workshop
            </h2>
            <p className="text-xs text-slate-400">
              Masuk untuk mengelola antrean pengerjaan & otomasi media sosial
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Operasional</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sneakercare.local"
                  className="pl-11 rounded-2xl border-slate-200 focus:border-sky-400 focus:ring-sky-400 h-11 text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 rounded-2xl border-slate-200 focus:border-sky-400 focus:ring-sky-400 h-11 text-xs font-medium"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" /> Akun Demo Bawaan:
              </div>
              <div>Admin: <span className="font-mono font-bold text-sky-700">admin@sneakercare.local</span> (pass: admin123)</div>
              <div>Operator: <span className="font-mono font-bold text-sky-700">operator@sneakercare.local</span> (pass: admin123)</div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-black text-base rounded-full shadow-[0_10px_25px_rgba(0,194,255,0.3)] h-12 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memverifikasi...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-400">
          © 2026 SO CLEAN SneakerCare. Zero-OPEX Edge Architecture.
        </p>
      </div>
    </div>
  );
}
