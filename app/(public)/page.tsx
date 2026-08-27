import Link from "next/link";
import Image from "next/image";
import { getServices, getShowcasePairs } from "@/actions/orders";
import { ServiceTierTabs } from "@/components/shared/ServiceTierTabs";
import { ShowcaseSliderCarousel } from "@/components/shared/ShowcaseSliderCarousel";
import { ScribbleArrow, FloatingNote } from "@/components/shared/ScribbleArrow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  Droplets,
  Truck,
  Instagram,
  CheckCircle2,
  Package,
  Layers,
  Zap,
  Flame,
  Feather,
  SunMedium,
  Check,
  ShoppingBag,
} from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const { data: servicesList = [] } = await getServices();
  const { data: showcasePairs = [] } = await getShowcasePairs();

  return (
    <div className="flex flex-col gap-20 pb-24 overflow-hidden bg-white">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Refrensi: Hero SOCLEAN dengan Floating Sneaker & Cyan Aura) */}
      {/* ========================================================================= */}
      <section className="relative pt-8 md:pt-16 pb-12 overflow-hidden">
        {/* Soft Sky Blue / Cyan Glowing Aura Blob */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-cyan-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="container grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 text-left relative">
            {/* Top Floating Badge with Scribble Arrow */}
            <div className="flex items-center gap-3">
              <ScribbleArrow className="text-sky-400 hidden sm:block" />
              <FloatingNote tilt="right" className="border-sky-200">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>Pengerjaan 1-3 Hari • Tersedia Opsi Express</span>
              </FloatingNote>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-slate-900 leading-[1.12]">
              Perawatan & Cuci Sneaker <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
                Komprehensif & Higienis
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
              Sepatu bersih mencerminkan kepribadian Anda. Nikmati pencucian mendalam, unyellowing, dan restorasi warna dengan standar kualitas workshop profesional.
            </p>

            {/* Glowing Gradient CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="space-y-1.5 w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-black text-base rounded-full px-9 h-14 shadow-[0_10px_25px_rgba(0,194,255,0.35)] transition-all hover:scale-105"
                >
                  <Link href="/booking">
                    <ShoppingBag className="w-5 h-5 mr-2" /> Booking Cuci Sekarang
                  </Link>
                </Button>
                <span className="text-[11px] text-slate-400 block sm:text-center font-medium">
                  Kalkulasi harga instan dalam 1 menit
                </span>
              </div>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full border-slate-200 text-slate-700 font-bold hover:bg-slate-50 h-14 px-7"
              >
                <Link href="/track">
                  <Search className="w-4 h-4 mr-2 text-sky-500" /> Lacak Status Order
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Floating 3D Angled Sneaker with Cyan Glow */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-b from-sky-50/50 via-white to-sky-100/40 p-4 border border-sky-100/80 shadow-[0_20px_50px_rgba(0,194,255,0.12)] flex items-center justify-center group">
              <Image
                src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop"
                alt="Sneaker Care Professional"
                fill
                className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 500px"
                priority
              />

              {/* Floating Bottom Badge */}
              <div className="absolute -bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-sky-100 shadow-xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-black text-slate-900 block">Garansi Bersih 100%</span>
                  <span className="text-[10px] text-slate-400">Quality Control 3 Tahap</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Floating Feature Badges Under Hero */}
        <div className="container mt-12 pt-6 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-3.5 hover:border-sky-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block">Repaint & Restorasi</span>
                <span className="text-[11px] text-slate-400">Rekondisi warna pudar & perbaikan sol</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-3.5 hover:border-sky-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block">Formula Kimia Premium</span>
                <span className="text-[11px] text-slate-400">PH netral aman untuk semua jenis serat</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-3.5 hover:border-sky-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block">99% Efektif & Higienis</span>
                <span className="text-[11px] text-slate-400">Bebas bakteri, jamur & bau apek</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION 2: KEUNGGULAN MATERIAL (Refrensi: "Nikmati Sepatu Bersih")      */}
      {/* ========================================================================= */}
      <section id="features" className="container space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Kenakan Sepatu Anda <span className="text-sky-500">dengan Percaya Diri</span> Tanpa Khawatir Kondisi Cuaca
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Menggunakan uap bertekanan dan kombinasi dry & wet cleaning khusus tanpa merusak lapisan pelindung asli sepatu.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <ScribbleArrow className="text-sky-400 hidden sm:block" />
            <FloatingNote tilt="left">
              <span>Semua Jenis Bahan: Leather, Suede, Canvas, Mesh</span>
            </FloatingNote>
          </div>
        </div>

        {/* Big Split Showcase Card */}
        <div className="rounded-3xl bg-slate-50/70 border border-slate-100 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 6-Grid Feature Icons */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono font-bold text-sky-600 uppercase tracking-wider block">
                Pembersihan & Restorasi Sepatu Mass-Market, Brand & Luxury
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-100/80 shadow-sm flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Feather className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Restorasi Warna & Kulit</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Mengembalikan elastisitas dan warna bahan suede / nubuck.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-100/80 shadow-sm flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Hilangkan Noda Garam & Minyak</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Penghilangan bercak air hujan, minyak, dan debu membandel.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-100/80 shadow-sm flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                    <SunMedium className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Unyellowing Sole Karet</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Memutihkan kembali sol kuning teroksidasi matahari.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-100/80 shadow-sm flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Deep Clean Upper & Insole</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Pembersihan luar dan dalam hingga ke celah terkecil.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-100/80 shadow-sm flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Reglue & Reparasi Sol</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Perekat khusus berkekuatan tinggi untuk sol yang mangap.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-100/80 shadow-sm flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Ozon Disinfeksi Anti-Bau</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Sterilisasi kabin sepatu membunuh 99.9% bakteri penyebab bau.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sneaker Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-3xl bg-white p-4 border border-slate-100 shadow-md">
                <Image
                  src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop"
                  alt="Air Jordan 1 High Cleaned"
                  fill
                  className="object-cover rounded-2xl"
                  sizes="400px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 3: BEFORE & AFTER SHOWCASE (Refrensi: Interactive Slider)       */}
      {/* ========================================================================= */}
      <section id="showcase" className="container space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Perawatan Rumahan Bisa Merusak — <br className="hidden sm:inline" />
              <span className="text-sky-500">Lihat Hasil Restorasi Profesional</span> Tim Kami
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Tarik garis pemisah untuk membandingkan kondisi sepatu sebelum dan sesudah treatment di workshop kami.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <ScribbleArrow className="text-sky-400 hidden sm:block" />
            <FloatingNote tilt="right">
              <span>Koleksi Hypebeast, Luxury & Sepatu Kerja</span>
            </FloatingNote>
          </div>
        </div>

        {/* Carousel Slider */}
        <ShowcaseSliderCarousel items={showcasePairs as any} />
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 4: PAKET LAYANAN & TIER DETAIL (Refrensi: Tabs & Tier Detail)    */}
      {/* ========================================================================= */}
      <section id="services" className="container space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Mengatasi Segala Jenis Kotoran & <br className="hidden sm:inline" />
              <span className="text-sky-500">Memperpanjang Umur Sepatu</span> Anda
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Pilih paket pengerjaan yang sesuai dengan kebutuhan dan kondisi material sepatu Anda.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <ScribbleArrow className="text-sky-400 hidden sm:block" />
            <FloatingNote tilt="left">
              <span>Garansi 100% Kepuasan Pengerjaan</span>
            </FloatingNote>
          </div>
        </div>

        {/* Interactive Category Tabs with Detailed Breakdown */}
        <ServiceTierTabs services={servicesList} />
      </section>

      {/* ========================================================================= */}
      {/* 5. BOTTOM CTA BANNER & QUICK BOOKING                                      */}
      {/* ========================================================================= */}
      <section className="container">
        <div className="rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white p-8 md:p-14 shadow-[0_20px_50px_rgba(0,194,255,0.3)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left z-10 max-w-xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-100 block">
              Layanan Jemput Antar Tersedia
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Kembalikan Tampilan Baru Sepatu Kesayangan Anda Hari Ini.
            </h3>
            <p className="text-sky-100 text-sm leading-relaxed">
              Daftarkan pesanan Anda secara online dan pantau langsung proses cuci via nomor resi pelacakan real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 font-black text-base rounded-full px-8 h-14 shadow-lg shrink-0"
            >
              <Link href="/booking">
                Booking Sekarang <ArrowRight className="w-5 h-5 ml-2 text-sky-500" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
