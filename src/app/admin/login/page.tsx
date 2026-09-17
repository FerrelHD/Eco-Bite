"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Lock, ArrowRight, AlertCircle, Sparkles, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ecobite.ac.id");
  const [password, setPassword] = useState("ecobite123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }

      if (data.user.role !== "ADMIN") {
        setError("Akses ditolak: Akun Anda bukan administrator kampus.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal menghubungkan ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setEmail("admin@ecobite.ac.id");
    setPassword("ecobite123");
    setLoading(true);
    try {
      await fetch("/api/auth/switch-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN" }),
      });
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Gagal masuk demo admin");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl mx-auto bg-slate-800 border border-slate-700 flex items-center justify-center text-status-warning shadow-card">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          <span>Area Terbatas • Kampus Sustainability Office</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Portal Administrator Universitas</h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Audit dampak lingkungan kampus, verifikasi kelayakan kantin hijau, dan persetujuan portofolio SKPI SDG 12.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-800/90 py-8 px-6 shadow-2xl rounded-3xl border border-slate-700 space-y-5">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Administrator</label>
              <div className="relative">
                <Award className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecobite.ac.id"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-secondary text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-secondary text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 rounded-full text-xs transition shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Mengotentikasi..." : "Masuk ke Panel Audit SDG"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Shortcut */}
          <div className="pt-4 border-t border-slate-700 space-y-2">
            <span className="text-[11px] text-slate-400 block text-center">Akun Uji Coba Admin Demo:</span>
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              disabled={loading}
              className="w-full bg-slate-700/80 hover:bg-slate-700 text-amber-300 font-semibold py-2 px-3 rounded-xl border border-amber-400/30 text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Klik Masuk sebagai Dr. Siti Rahmawati (Kantor SDG)</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-white">
              ← Kembali ke Beranda Pengguna
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
