import React from "react";
import Link from "next/link";
import { Sparkles, Instagram, MessageCircle, MapPin, Phone, Waves } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50/80 py-12 text-slate-500">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2.5 font-black text-slate-900 text-lg">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-sky-400/20">
              <Waves className="w-4 h-4" />
            </div>
            <div className="flex items-baseline">
              <span className="font-black text-slate-900 tracking-tighter text-xl">SO</span>
              <span className="font-black text-sky-500 tracking-tighter text-xl">CLEAN</span>
            </div>
          </div>
          <p className="text-xs max-w-md text-slate-400 leading-relaxed">
            Platform operasional dan perawatan laundry sneaker modern. Layanan cuci komprehensif, unyellowing, dan restorasi warna dengan pelacakan real-time transparan dan publikasi portofolio otomatis.
          </p>
          <div className="flex items-center gap-2.5 pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-sky-500 hover:border-sky-200 transition-all shadow-sm"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Layanan Spesialis</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/#services" className="hover:text-sky-500 transition-colors">Deep Clean Comprehensive</Link></li>
            <li><Link href="/#services" className="hover:text-sky-500 transition-colors">Fast Clean Express</Link></li>
            <li><Link href="/#services" className="hover:text-sky-500 transition-colors">Unyellowing Sole De-Oxidation</Link></li>
            <li><Link href="/#services" className="hover:text-sky-500 transition-colors">Repaint & Color Restoration</Link></li>
            <li><Link href="/#services" className="hover:text-sky-500 transition-colors">Leather & Suede Care</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Workshop Kami</h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-500 mt-0.5" />
              <span>Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0 text-sky-500" />
              <span>+62 812-3456-7890</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mt-8 pt-6 border-t border-slate-200/60 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>© 2026 SO CLEAN SneakerCare & AutoSocial. 100% Zero-OPEX Serverless Edge Architecture.</span>
        <div className="flex gap-4 font-medium">
          <Link href="/track" className="hover:text-sky-500 transition-colors">Lacak Resi</Link>
          <Link href="/login" className="hover:text-sky-500 transition-colors">Admin Portal</Link>
        </div>
      </div>
    </footer>
  );
}
