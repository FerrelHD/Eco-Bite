"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("mahasiswa@ecobite.ac.id");
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

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal menghubungkan ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoStudent = async () => {
    setEmail("mahasiswa@ecobite.ac.id");
    setPassword("ecobite123");
    setLoading(true);
    try {
      await fetch("/api/auth/switch-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "STUDENT" }),
      });
      router.push("/");
      router.refresh();
    } catch {
      setError("Gagal masuk demo mahasiswa");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl mx-auto overflow-hidden shadow-card border border-brand-secondary/30">
          <Image src="/icon.svg" alt="EcoBite" width={64} height={64} className="w-full h-full" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-brand-dark">Portal Mahasiswa EcoBite</h2>
        <p className="text-xs text-text-muted max-w-xs mx-auto">
          Masuk dengan akun Single Sign-On (SSO) universitas untuk menyelamatkan makanan surplus kampus.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface-card py-8 px-6 shadow-card rounded-3xl border border-border-subtle space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-text-primary mb-1">Email Mahasiswa / SSO</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@ecobite.ac.id"
                  className="w-full pl-9 pr-3 py-2.5 bg-surface-canvas rounded-xl border border-border-subtle focus:ring-2 focus:ring-brand-secondary text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-surface-canvas rounded-xl border border-border-subtle focus:ring-2 focus:ring-brand-secondary text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-full text-xs transition shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Masuk ke Beranda"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Shortcut */}
          <div className="pt-4 border-t border-border-subtle space-y-2">
            <span className="text-[11px] text-text-muted block text-center">Akun Uji Coba Demo:</span>
            <button
              type="button"
              onClick={handleQuickDemoStudent}
              disabled={loading}
              className="w-full bg-brand-light hover:bg-emerald-100 text-brand-primary font-semibold py-2 px-3 rounded-xl border border-brand-secondary/40 text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
              <span>1-Klik Masuk sebagai Rian Pratama (FT UI)</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-text-muted hover:text-brand-primary">
              ← Kembali ke Beranda Tamu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
