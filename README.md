<p align="center">
  <img src="public/icon.svg" width="120" height="120" alt="EcoBite Logo" />
</p>

<h1 align="center">EcoBite — Sustainable Campus Food Rescue Platform</h1>

<p align="center">
  <strong>Platform Penyelamatan Pangan Surplus Kampus Berdiskon 50%–70% Terintegrasi dengan Dampak Lingkungan (SDG 12) & Portofolio SKPI</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Ready-336791?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Deploy-Vercel_Free-000000?logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/SDG-12_Responsible_Consumption-E5243B" alt="SDG 12" />
</p>

---

## 🌿 1. Ringkasan & Filosofi Proyek

**EcoBite** adalah platform penyelamatan pangan kampus inovatif yang menghubungkan mahasiswa dengan kantin, kafe, dan bakery fakultas. Misi utamanya adalah menekan timbulan sampah makanan (*food waste*) di kawasan universitas, menyediakan akses nutrisi berkualitas dengan diskon 50%–70%, serta mengedukasi mahasiswa melalui dampak lingkungan nyata (*CO2 reduction, EcoPoints, dan sinkronisasi SKPI*).

### Pilar Desain & Pengalaman Pengguna (Design System v2.0.0):
1. **Low Cognitive Load & Clarity:** Antarmuka fokus tanpa pop-up mengganggu, navigasi terstruktur, dan rasio kontras WCAG AAA.
2. **Apple HIG & Linear Aesthetics:** Tipografi hierarkis tegas (*Plus Jakarta Sans*), radius kartu halus (`rounded-lg: 18px`), palet warna alam *Forest Green* (`#2D6A4F`) dan aksen *Mint* (`#52B788`).
3. **Strict Role-Based Architecture:** Pemisahan total antara antarmuka Konsumen, Mitra Kasir, dan Administrator Universitas.

---

## 🏛️ 2. Arsitektur 3 Portal Terpisah

Aplikasi menerapkan pemisahan rute penuh dengan **Next.js Edge Middleware Guard** untuk menjamin keamanan hak akses:

```text
EcoBite Ecosystem
│
├── 🛍️ 1. Portal Mahasiswa / Konsumen (Route: `/`)
│   ├── Beranda Marketplace (Katalog Surplus, Diskon Coret, Urgensi Stok)
│   ├── Jelajah Radar Kampus (Peta Interaktif Geofence 800m Pejalan Kaki)
│   ├── Tiket Penyelamatanku (Apple Pass Style, Dynamic HMAC QR, Countdown Timer)
│   └── Profil & Dampak Hijau (Statistik CO2, Aksi BYOC +50 Poin, Sinkronisasi SKPI)
│
├── 🏪 2. Portal Mitra Kantin / Kasir (Route: `/merchant`)
│   ├── Kontrol Status Operasional Gerai (Sakelar Buka / Tutup)
│   ├── 3 KPI Finansial & Keberlanjutan Real-Time (Porsi Terjual, Pendapatan, Bobot Sampah Dicegah)
│   ├── Point of Redemption POS (Scanner Kamera QR & Input Kode Manual 5-Digit)
│   └── Manajemen Listing Surplus & Live Queue Antrean Penjemputan
│
└── 🛡️ 3. Portal Administrator Kampus (Route: `/admin`)
    ├── Monitoring Dampak ESG & Total Karbon Dicegah Seluruh Universitas
    ├── Audit & Sertifikasi Kantin Hijau Kampus (Level Gold, Silver, Bronze)
    └── Validasi & Ekspor Portofolio SKPI SDG 12 Mahasiswa ke SIAK-NG
```

---

## 🔐 3. Fitur Keamanan & Algoritma Unggulan

### A. Anti-Double Booking Concurrency Protection
Mencegah *race condition* ketika puluhan mahasiswa memesan sisa 1–2 porsi makanan terakhir secara bersamaan.
- Dibungkus dalam transaksi database atomik kondisional:
  ```typescript
  const updated = await tx.surplusItem.updateMany({
    where: {
      id: itemId,
      stockQuantity: { gte: quantity },
      status: "AVAILABLE",
    },
    data: {
      stockQuantity: { decrement: quantity },
      version: { increment: 1 },
    },
  });
  if (updated.count === 0) throw new Error("OUT_OF_STOCK");
  ```
- **Hasil Uji Otomasi:** 10 permintaan serentak pada 2 porsi terakhir menghasilkan **2 Pesanan Sukses dan 8 Ditolak (Habis)** dengan integritas stok 100% konsisten.

### B. Cryptographic Dynamic QR Code (HMAC-SHA256)
Tiket pengambilan (*Rescue Pass*) dilengkapi QR Code dinamis berbasis waktu:
- Format Token: `v1.<orderId>.<orderNumber>.<timestamp>.<nonce>.<signature>`
- Mencegah pemalsuan tiket menggunakan tangkapan layar (*screenshot replay attack*), manipulasi nomor pesanan, maupun tiket yang telah kedaluwarsa.

### C. Strict RBAC Middleware Guard
File `src/middleware.ts` memeriksa token JWT secara otomatis pada edge layer:
- Mahasiswa yang mencoba mengakses `/admin` atau `/merchant` otomatis diblokir dan dialihkan (*redirect*).
- Setiap halaman login (`/login`, `/merchant/login`, `/admin/login`) memiliki proteksi terisolasi.

---

## 🚀 4. Cara Menjalankan di Lokal (Development)

### Prasyarat
- Node.js versi 18.x atau lebih baru (Disarankan Node.js v20+)
- npm atau pnpm

### Langkah Instalasi
```bash
# 1. Clone repository
git clone https://github.com/FerrelHD/Eco-Bite.git
cd Eco-Bite

# 2. Install dependencies
npm install

# 3. Salin file environment
cp .env.example .env

# 4. Inisialisasi Database & Seeding Data Awal
# (Mengisi kantin demo, menu surplus, fasilitas peta kampus, dan pesanan aktif)
npx prisma db push
npm run db:seed

# 5. Jalankan Automated Test Suite
npm run test:concurrency   # Uji ketahanan stok concurrency
npm run test:qr            # Uji validasi kriptografi QR Code

# 6. Jalankan Server Development
npm run dev
```
Buka peramban di `http://localhost:3000`.

---

## 🔑 5. Akun Uji Coba Demo (Pre-Seeded)

Setiap portal memiliki tombol **1-Klik Demo Login** sehingga penguji atau dosen penguji dapat langsung mencoba tanpa mengetik:

| Role / Peran | URL Portal | Email Akun | Kata Sandi | Keterangan |
|---|---|---|---|---|
| **Mahasiswa** | `/login` | `mahasiswa@ecobite.ac.id` | `ecobite123` | Rian Pratama (FT UI) • 1.250 EcoPoints |
| **Mitra Kantin** | `/merchant/login` | `kulina@ecobite.ac.id` | `ecobite123` | Kulina Bakery & Pastry • Level Gold |
| **Admin Kampus** | `/admin/login` | `admin@ecobite.ac.id` | `ecobite123` | Dr. Siti Rahmawati • SDG 12 Office |

---

## ☁️ 6. Panduan Deployment Gratis (Vercel + Neon/Supabase)

Aplikasi ini 100% siap di-deploy secara gratis tanpa biaya:

### Langkah 1: Buat Database PostgreSQL Serverless Gratis
1. Buka [Neon.tech](https://neon.tech) atau [Supabase.com](https://supabase.com) (Gratis selamanya tanpa kartu kredit).
2. Buat proyek baru dan salin **Connection String PostgreSQL** Anda:
   ```text
   postgresql://user:password@ep-sample-1234.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Langkah 2: Deploy ke Vercel
1. Buka [Vercel Dashboard](https://vercel.com) dan klik **Add New Project**.
2. Pilih repository GitHub: `FerrelHD/Eco-Bite`.
3. Pada bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL` = *(URL PostgreSQL dari Langkah 1)*
   - `JWT_SECRET` = `ecobite-jwt-production-secret-key-2026`
   - `QR_HMAC_SECRET` = `ecobite-campus-food-rescue-secret-key-2026`
4. Klik **Deploy**.

### Langkah 3: Sinkronisasi Skema Database di Cloud
Jalankan perintah ini sekali dari terminal lokal Anda yang terhubung ke database cloud:
```bash
DATABASE_URL="your-cloud-database-url" npx prisma db push
DATABASE_URL="your-cloud-database-url" npm run db:seed
```
Selesai! Aplikasi EcoBite Anda telah aktif secara publik dengan domain gratis `*.vercel.app` dan sertifikat SSL otomatis.

---

## 📂 7. Struktur Direktori Proyek

```text
Eco-Bite/
├── prisma/
│   ├── schema.prisma         # Relational schema (PostgreSQL ready)
│   └── seed.ts               # Pre-seeded canteens, items, & facilities
├── public/
│   ├── icon.svg              # Brand icon & favicon resmi EcoBite
│   └── ...
├── scripts/
│   ├── test-concurrency.ts   # Concurrency & race condition test suite
│   └── test-qr-security.ts   # HMAC-SHA256 digital signature test suite
├── src/
│   ├── app/
│   │   ├── (consumer)/page.tsx  # Portal Mahasiswa
│   │   ├── login/page.tsx       # Login Mahasiswa
│   │   ├── merchant/page.tsx    # Portal Mitra Kantin (POS)
│   │   ├── merchant/login/      # Login Mitra Kantin
│   │   ├── admin/page.tsx       # Portal Administrator Universitas
│   │   ├── admin/login/         # Login Administrator
│   │   └── api/                 # Endpoint RESTful (Orders, POS, Auth, SKPI)
│   ├── components/
│   │   ├── consumer/            # MarketplaceView, CampusMapView, ActivePass, Profile
│   │   ├── merchant/            # MerchantDashboard & POS Scanner
│   │   └── Header.tsx           # Student dedicated navbar
│   ├── lib/
│   │   ├── auth.ts              # JWT & bcrypt authentication
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── qr-security.ts       # Cryptographic token generator & validator
│   │   └── rate-limit.ts        # In-memory sliding window rate limiter
│   └── middleware.ts            # Next.js Edge Route Guard
├── tailwind.config.ts           # Token warna v2.0.0 (Forest Green, Mint, Canvas)
└── README.md                    # Dokumentasi komprehensif
```

---

## 📄 8. Lisensi & Kontributor
Dikembangkan untuk inisiatif penyelamatan pangan berkelanjutan dan edukasi zero waste di lingkungan universitas.  
Repository: [github.com/FerrelHD/Eco-Bite](https://github.com/FerrelHD/Eco-Bite)
