"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Store, LogOut, ShieldCheck } from "lucide-react";
import { MerchantDashboard } from "@/components/merchant/MerchantDashboard";

export default function MerchantStandalonePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || (data.user.role !== "MERCHANT" && data.user.role !== "ADMIN")) {
          router.push("/merchant/login");
        } else {
          setLoading(false);
        }
      })
      .catch(() => router.push("/merchant/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/merchant/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-canvas text-text-primary flex flex-col">
      {/* Dedicated Merchant Header */}
      <header className="bg-brand-dark text-white border-b border-brand-primary sticky top-0 z-50 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm shrink-0 border border-brand-secondary/40">
              <Image src="/icon.svg" alt="EcoBite" width={40} height={40} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white">EcoBite Merchant POS</span>
                <span className="bg-brand-secondary/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-secondary/40">
                  Operasional Gerai
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Sistem Kasir & Manajemen Surplus Harian</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition border border-white/15"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Gerai</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Merchant Ops Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <MerchantDashboard />
      </main>
    </div>
  );
}
