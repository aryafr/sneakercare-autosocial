"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, ShieldCheck, ShoppingBag, MessageCircle, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="container flex h-20 items-center justify-between">
        {/* Brand Logo with Wave Splash */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-black tracking-tight text-xl text-slate-900 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-400/25 group-hover:scale-105 transition-transform">
              <Waves className="w-5 h-5" />
            </div>
            <div className="flex items-baseline">
              <span className="font-black text-slate-900 tracking-tighter text-2xl">SO</span>
              <span className="font-black text-sky-500 tracking-tighter text-2xl">CLEAN</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/#services" className="hover:text-sky-500 transition-colors">
            Layanan & Treatment
          </Link>
          <Link href="/#features" className="hover:text-sky-500 transition-colors">
            Keunggulan
          </Link>
          <Link href="/#showcase" className="hover:text-sky-500 transition-colors">
            Before & After
          </Link>
          <Link href="/track" className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
            <Search className="w-4 h-4 text-sky-500" />
            <span>Lacak Resi</span>
          </Link>
        </nav>

        {/* Right Actions: WhatsApp Pill & Admin & Booking Button */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 text-xs font-bold transition-all shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>+62 812-3456-7890</span>
          </a>

          <Button asChild variant="ghost" size="sm" className="font-semibold text-slate-400 hover:text-slate-900 text-xs">
            <Link href="/login">
              <ShieldCheck className="w-4 h-4 mr-1" /> Admin
            </Link>
          </Button>

          <Button asChild size="sm" className="bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-bold rounded-full px-5 shadow-md shadow-sky-400/20 text-xs">
            <Link href="/booking">
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Booking Online
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Button asChild size="sm" className="bg-sky-500 text-white font-bold text-xs h-9 px-3 rounded-full">
            <Link href="/booking">Booking</Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b bg-white px-6 py-4 space-y-3 shadow-lg">
          <Link
            href="/#services"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-sky-500 py-1.5"
          >
            Layanan & Treatment
          </Link>
          <Link
            href="/#features"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-sky-500 py-1.5"
          >
            Keunggulan Workshop
          </Link>
          <Link
            href="/#showcase"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-sky-500 py-1.5"
          >
            Galeri Before & After
          </Link>
          <Link
            href="/track"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-sky-500 py-1.5"
          >
            Lacak Status Resi
          </Link>
          <div className="pt-3 border-t flex flex-col gap-2">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200"
            >
              <MessageCircle className="w-4 h-4" /> Hubungi WhatsApp Workshop
            </a>
            <Button asChild variant="outline" className="w-full justify-center text-xs">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                Portal Admin
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
