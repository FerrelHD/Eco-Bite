"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Search, ShieldCheck, Compass, Ticket, BarChart3, LogOut, User } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  userName?: string;
  ecoPoints: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  userName,
  ecoPoints,
  searchQuery,
  setSearchQuery,
  isLoggedIn,
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border-subtle shadow-subtle">
      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab("marketplace")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-full h-full">
              <defs>
                <linearGradient id="navBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#52B788" />
                  <stop offset="100%" stopColor="#2D6A4F" />
                </linearGradient>
                <linearGradient id="navLeafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#D8F3DC" />
                </linearGradient>
              </defs>
              <rect width="512" height="512" rx="115" fill="url(#navBgGrad)" />
              <path d="M128 260 C 128 370, 384 370, 384 260 Z" fill="url(#navLeafGrad)" />
              <path d="M256 250 C 210 210, 160 210, 160 150 C 220 150, 250 200, 256 250 Z" fill="#D8F3DC" />
              <path d="M256 250 C 302 210, 352 210, 352 150 C 292 150, 262 200, 256 250 Z" fill="#FFFFFF" />
              <circle cx="256" cy="120" r="14" fill="#D8F3DC" opacity="0.8" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-brand-primary">EcoBite</span>
              <span className="bg-brand-light text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-secondary/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-brand-secondary" />
                Kampus
              </span>
            </div>
            <p className="text-[11px] text-text-muted hidden sm:block">Penyelamatan Pangan Surplus Kampus</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari roti, nasi bakar, kafe, atau fakultas..."
              className="w-full pl-9 pr-4 py-2 bg-surface-canvas rounded-md border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-secondary text-sm transition"
            />
          </div>
        </div>

        {/* User Stats & Profile Controls */}
        <div className="flex items-center gap-3">
          {/* EcoPoints Pill */}
          <button
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-2 bg-brand-light hover:bg-emerald-100 text-brand-primary px-3 py-1.5 rounded-full border border-brand-secondary/40 font-semibold text-xs sm:text-sm transition shadow-subtle"
            title="Lihat Rincian EcoPoints & Dampak"
          >
            <Leaf className="w-4 h-4 text-brand-secondary fill-brand-secondary" />
            <span>{ecoPoints.toLocaleString("id-ID")} Poin</span>
          </button>

          {/* User Account / Login State */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("profile")}
                className="hidden sm:flex items-center gap-1.5 bg-surface-canvas hover:bg-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-text-primary border border-border-subtle transition"
              >
                <User className="w-3.5 h-3.5 text-brand-primary" />
                <span className="truncate max-w-[120px]">{userName || "Mahasiswa"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-text-muted hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition"
                title="Keluar Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-subtle"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Tab Bar — Exclusively for Students/Consumers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 sm:space-x-4 border-t border-border-subtle/60 py-1 text-sm scrollbar-none">
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap text-xs sm:text-sm ${
            activeTab === "marketplace"
              ? "bg-brand-light text-brand-primary font-bold border-b-2 border-brand-primary"
              : "text-text-muted hover:text-text-primary hover:bg-surface-canvas"
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>Beranda Surplus</span>
        </button>

        <button
          onClick={() => setActiveTab("map")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap text-xs sm:text-sm ${
            activeTab === "map"
              ? "bg-brand-light text-brand-primary font-bold border-b-2 border-brand-primary"
              : "text-text-muted hover:text-text-primary hover:bg-surface-canvas"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Jelajah Radar Kampus</span>
        </button>

        <button
          onClick={() => setActiveTab("ticket")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap text-xs sm:text-sm ${
            activeTab === "ticket"
              ? "bg-brand-light text-brand-primary font-bold border-b-2 border-brand-primary"
              : "text-text-muted hover:text-text-primary hover:bg-surface-canvas"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Tiket Penyelamatanku</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap text-xs sm:text-sm ${
            activeTab === "profile"
              ? "bg-brand-light text-brand-primary font-bold border-b-2 border-brand-primary"
              : "text-text-muted hover:text-text-primary hover:bg-surface-canvas"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Profil & Dampak SKPI</span>
        </button>
      </div>
    </header>
  );
};
