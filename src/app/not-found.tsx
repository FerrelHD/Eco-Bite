import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface-canvas text-center">
      <h2 className="text-2xl font-bold text-brand-primary">404 - Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-text-muted mt-2">
        Halaman yang Anda cari tidak tersedia di ekosistem EcoBite.
      </p>
      <Link
        href="/"
        className="mt-4 bg-brand-primary text-white font-bold py-2 px-5 rounded-full text-xs hover:bg-brand-dark transition"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
