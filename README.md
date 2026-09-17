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
  <img src="https://img.shields.io/badge/SDG-12_Responsible_Consumption-E5243B" alt="SDG 12" />
</p>

---

## 🌿 Tentang EcoBite

**EcoBite** adalah platform web penyelamatan pangan surplus kampus yang menghubungkan mahasiswa dengan kantin, kafe, dan bakery fakultas. Misi utamanya adalah menekan timbulan sampah makanan (*food waste*) di lingkungan universitas, menyediakan akses pangan berkualitas dengan harga terjangkau (diskon 50%–70%), serta mendorong gaya hidup berkelanjutan melalui pelacakan dampak lingkungan (*CO2 reduction*, *EcoPoints*, dan e-sertifikat SKPI).

---

## ✨ Fitur Utama

### 🛍️ 1. Portal Mahasiswa (Konsumen)
- **Katalog Surplus Real-Time:** Menampilkan menu makanan berlebih menjelang jam tutup kantin dengan harga diskon, info alergen, dan sisa porsi.
- **Radar Kampus Interaktif:** Peta visual lokasi kantin dan fasilitas pendukung (water refill station, microwave umum) dengan deteksi lokasi GPS.
- **Tiket Penyelamatan (Rescue Pass):** Tiket digital interaktif lengkap dengan kode QR dan *countdown timer* penjemputan.
- **Dampak Hijau & SKPI:** Riwayat penyelamatan makanan, kalkulasi pencegahan emisi CO2, bonus EcoPoints aksi BYOC (*Bring Your Own Container*), serta ekspor portofolio SKPI.

### 🏪 2. Portal Mitra Kantin (Merchant & Kasir)
- **Status Operasional Gerai:** Kontrol buka/tutup pesanan surplus harian.
- **Ringkasan Penjualan:** Pantauan porsi terselamatkan, pendapatan harian, dan sampah makanan yang berhasil dicegah.
- **Verifikasi Pesanan (POS):** Pemindai QR kamera dan opsi input kode tiket manual untuk validasi pengambilan makanan yang cepat di kasir.
- **Manajemen Menu:** Tambah dan kelola stok makanan surplus dengan mudah.

### 🛡️ 3. Portal Administrator Kampus
- **Monitoring Dampak ESG Kampus:** Laporan analitik total makanan terselamatkan dan estimasi karbon dicegah di tingkat universitas.
- **Audit & Sertifikasi Kantin:** Evaluasi predikat ramah lingkungan mitra kantin (Gold, Silver, Bronze).
- **Validasi Portofolio SKPI:** Verifikasi poin dan sertifikat kegiatan lingkungan mahasiswa.

---

## 🚀 Panduan Memulai (Development)

### Prasyarat
- Node.js versi 18 ke atas (Direkomendasikan versi 20+)
- npm / pnpm / yarn

### Langkah Instalasi
```bash
# 1. Clone repository
git clone https://github.com/FerrelHD/Eco-Bite.git
cd Eco-Bite

# 2. Install dependensi
npm install

# 3. Salin konfigurasi environment
cp .env.example .env

# 4. Sinkronisasi database & data awal (seeding)
npx prisma db push
npm run db:seed

# 5. Jalankan server lokal
npm run dev
```
Buka browser dan akses **`http://localhost:3000`**.

---

## 🔑 Akun Demo Pengujian

Aplikasi telah dilengkapi data awal demo dan tombol *1-Click Login* untuk kemudahan demonstrasi:

| Role / Peran | Halaman Akses | Email Akun | Password | Profil Demo |
|---|---|---|---|---|
| **Mahasiswa** | `/login` | `mahasiswa@ecobite.ac.id` | `ecobite123` | Rian Pratama • FT |
| **Mitra Kantin** | `/merchant/login` | `kulina@ecobite.ac.id` | `ecobite123` | Kulina Bakery & Pastry |
| **Admin Kampus** | `/admin/login` | `admin@ecobite.ac.id` | `ecobite123` | Kantor Keberlanjutan & SDG 12 |

---

## ☁️ Panduan Deployment (Vercel + Database Cloud)

1. **Siapkan Database PostgreSQL Cloud:**
   Gunakan penyedia PostgreSQL serverless gratis seperti Neon atau Supabase, lalu salin URL koneksi database Anda.
2. **Deploy di Vercel:**
   - Hubungkan repository GitHub ke Vercel.
   - Atur Environment Variables di Vercel Dashboard:
     - `DATABASE_URL`: URL koneksi PostgreSQL Anda
     - `JWT_SECRET`: Kunci rahasia JWT unik Anda
     - `QR_HMAC_SECRET`: Kunci rahasia validasi QR Anda
   - Klik **Deploy**.
3. **Inisialisasi Skema di Cloud:**
   ```bash
   DATABASE_URL="<your-database-url>" npx prisma db push
   DATABASE_URL="<your-database-url>" npm run db:seed
   ```

---

## 📂 Struktur Direktori

```text
Eco-Bite/
├── prisma/               # Skema database & data seeding awal
├── public/               # Aset statis & logo
├── src/
│   ├── app/              # Rute Next.js App Router (Mahasiswa, Merchant, Admin, API)
│   ├── components/       # Komponen UI (Katalog, Radar Peta, Tiket, Kasir)
│   ├── lib/              # Utilitas aplikasi, helper database, & autentikasi
│   └── middleware.ts     # Proteksi rute berdasarkan peran (RBAC)
└── tailwind.config.ts    # Desain sistem & token warna EcoBite
```

---

## 📄 Lisensi
Dikembangkan untuk inisiatif pengurangan sampah pangan dan gaya hidup berkelanjutan di lingkungan universitas.
