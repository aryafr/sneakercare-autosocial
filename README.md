# 👟 homecleaning_shoes — Shoe Laundry & Portfolio Engine

> **100% Zero-OPEX Serverless Edge Platform** untuk operasional jasa laundry sepatu modern: *Customer Booking Wizard*, *Real-Time Tracking Timeline*, *Cetak Struk Thermal Barcode/QR (58mm/80mm)*, *Pintasan Kamera HP Operator*, serta *Multi-Channel Social Automation (Instagram, TikTok, Facebook, X)* berbasis **Postiz Engine** & **Upstash QStash Edge Cron**.

---

## 🚀 Fitur Utama

### 1. 🌐 Customer Facing & Booking Portal
- **Katalog Layanan Interaktif:** Paket Deep Clean, Fast Clean, Unyellowing, Repaint, Leather & Suede Care dengan kalkulasi transparan.
- **Multi-Item Booking Wizard:** Pemesanan banyak pasang sepatu sekaligus dalam 1 checkout dengan opsi layanan Express (1 Hari, +50%) dan Pickup & Delivery (+Rp 20.000).
- **Public Tracking System (`/track/[code]`):** Pelacakan status pengerjaan 5 tahapan secara *real-time*, slider interaktif *Before & After*, serta tombol cetak E-Nota kasir.

### 2. 📋 Workshop OS & Operator Dashboard (`/admin/dashboard`)
- **Workshop Kanban Board:** Agregasi omset lunas, order hari ini, antrean dalam pengerjaan, dan status siap diambil.
- **State Machine Pengerjaan:** Transisi status instan (*Antrian Masuk ➔ Proses Treatment ➔ Selesai Dicuci ➔ Pengeringan ➔ Siap Diambil ➔ Selesai*).
- **Pintasan Kamera HP Langsung (`capture="environment"`):** Teknisi dapat langsung membidik dan memotret foto *Before* dan *After* dari kamera ponsel tanpa repot mencari di galeri.
- **Cetak Struk & Label Thermal (58mm / 80mm):** Cetak label resi siap tempel di box sepatu dengan QR Code pelacakan dan rincian treatment.
- **Notifikasi WhatsApp Otomatis (*One-Click Notification*):** Pembuatan draft pesan WA resmi ke customer sesuai status terkini.

### 3. 📱 Postiz Social Automation Engine (`/admin/social`)
- **Multi-Channel Cross-Posting:** Satu kali jadwalkan konten ke **Instagram Feed, TikTok, Facebook Page, dan X (Twitter)** secara simultan.
- **Asisten AI Caption & Viral Hook:** Generator *copywriting* otomatis dengan 4 pilihan persona (*Executive Report, Viral Hook, Sneakerhead Grail, Weekend Promo*).
- **Live Device Mockup Preview:** Pratinjau langsung tampilan feed 1:1, TikTok card, atau Tweet sebelum ditayangkan.
- **Interactive Content Calendar:** Matriks kalender visual bulanan untuk memantau jadwal rilis portofolio workshop.
- **Dynamic 1:1 Before/After Watermark Stitching:** Kompilasi visual otomatis dengan badge resmi *SO CLEAN WORKSHOP* dan tanggal pengerjaan.

---

## 🛠️ Tech Stack & Arsitektur Zero-OPEX

| Layer | Teknologi |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Edge Routes) |
| **Language** | TypeScript (Strict Mode) |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Sonner Toaster |
| **Database & ORM** | [libSQL / Turso](https://turso.tech/) + [Drizzle ORM](https://orm.drizzle.team/) |
| **Authentication** | [Better-Auth](https://better-auth.com/) Session Tokens |
| **Edge Queue & Cron**| [Upstash QStash](https://upstash.com/docs/qstash) (Serverless Task Scheduler) |
| **Media & Storage** | [Cloudinary](https://cloudinary.com/) (Direct Client-to-Cloud Uploads) |

---

## 💻 Panduan Instalasi Lokal

### 1. Clone Repository
```bash
git clone https://github.com/your-username/sneakercare-autosocial.git
cd sneakercare-autosocial
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi variabel dasar (untuk pengembangan lokal menggunakan SQLite file):
```env
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
BETTER_AUTH_SECRET=sneakercare_super_secret_dev_key_123456789
BETTER_AUTH_URL=http://localhost:3000
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di **[http://localhost:3000](http://localhost:3000)**. Database SQLite dan data awal (services, admin, social channels) akan diinisialisasi otomatis saat pertama kali dibuka.

---

## 🧪 Pengujian & Verifikasi

Jalankan pengecekan tipe data TypeScript:
```bash
npx tsc --noEmit
```

Jalankan kompilasi produksi Next.js:
```bash
npm run build
```

---

## 🌐 Struktur Direktori Proyek

```
ShoeClean/
├── actions/             # Server Actions (Business Logic / Controller Layer)
│   ├── orders.ts        # Order CRUD, State Machine, Dashboard Metrics
│   ├── postiz.ts        # Multi-Channel Postiz Engine & AI Generator
│   ├── social.ts        # Social Accounts & Queue Management
│   └── upload.ts        # Cloudinary Signed Signature Generator
├── app/                 # Next.js 14 App Router
│   ├── (admin)/         # Rute Admin (Dashboard, Orders, Social, Calendar)
│   ├── (public)/        # Rute Publik (Home, Booking Wizard, Tracking)
│   └── api/             # API Endpoints (Stitch SVG, Webhooks, Better Auth)
├── components/          # Komponen UI Reusable
│   ├── forms/           # Form Booking Wizard
│   ├── layout/          # Navbar, Footer, AdminSidebar
│   ├── shared/          # ThermalReceipt, DirectImageUpload, ImageComparator
│   └── social/          # MultiChannelComposer, SocialCalendarView
├── db/                  # Konfigurasi Database Drizzle & Schema libSQL
│   ├── index.ts         # Inisialisasi Klien libSQL
│   ├── schema.ts        # Definisi Tabel Database
│   └── init.ts          # Auto-Migration & Seed Data
└── lib/                 # Utilitas, Helper, Validasi Zod
```

---

## 📄 Lisensi
Platform ini didistribusikan di bawah lisensi MIT.
