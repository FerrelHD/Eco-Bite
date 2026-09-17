"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Award,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Gift,
  Download,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Calendar,
} from "lucide-react";

interface StudentImpactData {
  student: {
    id: string;
    name: string;
    nim: string;
    faculty: string;
    ecoPoints: number;
    avatarUrl?: string;
    greenLevel: string;
    byocCount: number;
    totalPortionsRescued: number;
    totalCo2SavedKg: number;
    totalMoneySavedRp: number;
    skpiEligibility: {
      sdgCategory: string;
      requiredPoints: number;
      currentPoints: number;
      isEligible: boolean;
      certificateCode: string;
    };
  };
  collectiveCampusStats: {
    foodSavedKg: number;
    co2PreventedKg: number;
  };
}

export const ProfileImpactView: React.FC = () => {
  const [data, setData] = useState<StudentImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/impact/skpi")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.student) {
          setData(resData);
        }
      })
      .catch((err) => console.error("Failed to load SKPI impact:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSyncSKPI = () => {
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 4000);
  };

  if (loading || !data) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-pulse">
        <div className="h-40 bg-surface-card rounded-2xl border border-border-subtle"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-surface-card rounded-xl"></div>
          <div className="h-28 bg-surface-card rounded-xl"></div>
          <div className="h-28 bg-surface-card rounded-xl"></div>
        </div>
      </div>
    );
  }

  const { student } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Student Identity Card */}
      <div className="bg-gradient-to-r from-brand-primary via-emerald-800 to-brand-dark rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-48 h-48 bg-brand-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-brand-secondary/50 shadow-md shrink-0 bg-white/10">
            <Image
              src={student.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={student.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-brand-secondary/30 border border-brand-secondary/40 px-3 py-1 rounded-full text-xs font-semibold text-brand-light">
              <Award className="w-3.5 h-3.5 text-brand-secondary" />
              <span>{student.greenLevel}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{student.name}</h2>
            <p className="text-xs text-slate-300">
              NIM: {student.nim} • {student.faculty}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-brand-secondary fill-brand-secondary" />
                <span>{student.ecoPoints.toLocaleString("id-ID")} Total EcoPoints</span>
              </span>
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Akun Terverifikasi UI SSO</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Big Cumulative Impact Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Portions */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Porsi Diselamatkan
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center text-brand-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-primary">
              {student.totalPortionsRescued} Porsi
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Setara ~7.000 kkal nutrisi berkualitas tidak terbuang sia-sia.
            </p>
          </div>
        </div>

        {/* Metric 2: CO2 */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Reduksi Emisi CO2
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-brand-secondary">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-secondary">
              {student.totalCo2SavedKg} kg CO2
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Setara emisi gas buang motor sejauh ~65 kilometer.
            </p>
          </div>
        </div>

        {/* Metric 3: Money Saved */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Total Uang Dihemat
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-status-warning">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
              Rp {student.totalMoneySavedRp.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Diskon rata-rata 60% dibanding harga makanan reguler.
            </p>
          </div>
        </div>
      </div>

      {/* BYOC Habit & Badge Progress */}
      <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-card space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-text-primary">Kebiasaan Baik (Aksi BYOC)</h3>
            <p className="text-xs text-text-muted">
              Frekuensi membawa wadah makan sendiri saat penjemputan surplus.
            </p>
          </div>
          <span className="bg-brand-light text-brand-primary text-xs font-bold px-3 py-1 rounded-full border border-brand-secondary/30">
            {student.byocCount}x Aksi Hijau
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-brand-dark">Progres: Lencana Bebas Sampah Kampus</span>
            <span className="text-brand-secondary">8 / 10 Aksi (80%)</span>
          </div>
          <div className="w-full h-3 bg-surface-canvas rounded-full overflow-hidden border border-border-subtle">
            <div className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full w-[80%] transition-all duration-500"></div>
          </div>
          <p className="text-[11px] text-text-muted">
            Tinggal <strong>2 aksi BYOC lagi</strong> untuk meraih lencana emas & voucher makan Rp 25.000!
          </p>
        </div>
      </div>

      {/* Academic Integration: SKPI / SIAK-NG Sync */}
      <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">
                Integrasi Akademik SKPI / SIAK-NG
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Poin aksi penyelamatan makanan diakui resmi sebagai kegiatan pengabdian SDG 12 pada Surat Keterangan Pendamping Ijazah.
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncSKPI}
            className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2.5 px-4 rounded-full text-xs transition shadow-subtle flex items-center gap-2 shrink-0 self-end sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sinkronisasi ke SIAK-NG</span>
          </button>
        </div>

        {syncSuccess && (
          <div className="p-3 bg-brand-light text-brand-primary rounded-xl text-xs font-semibold flex items-center gap-2 border border-brand-secondary/40 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-brand-secondary" />
            <span>
              Berhasil! 1.250 EcoPoints telah disinkronisasikan ke portal akademik mahasiswa dengan kode verifikasi <strong>{student.skpiEligibility.certificateCode}</strong>.
            </span>
          </div>
        )}

        {/* Certificate Preview Card */}
        <div className="bg-surface-canvas rounded-xl p-4 border border-dashed border-border-subtle space-y-2 text-xs">
          <div className="flex justify-between font-semibold text-text-primary">
            <span>Kategori Portofolio SKPI:</span>
            <span className="text-brand-primary">{student.skpiEligibility.sdgCategory}</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>Status Verifikasi:</span>
            <span className="text-status-success font-bold">✓ Memenuhi Syarat Kelulusan Hijau (Eligible)</span>
          </div>
          <div className="flex justify-between text-text-muted font-mono text-[11px]">
            <span>Nomor Sertifikat Digital:</span>
            <span>{student.skpiEligibility.certificateCode}</span>
          </div>
        </div>
      </div>

      {/* Loyalty EcoPoints Rewards Catalog */}
      <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-card space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-text-primary">Tukar Saldo EcoPoints</h3>
            <p className="text-xs text-text-muted">
              Manfaatkan poin hasil penyelamatan makanan untuk voucher atau aksi nyata lingkungan.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-brand-primary">
            <Gift className="w-4 h-4" />
            <span>Saldo: {student.ecoPoints} Pts</span>
          </div>
        </div>

        {selectedReward && (
          <div className="p-3 bg-brand-light text-brand-primary rounded-xl text-xs font-semibold flex items-center gap-2 border border-brand-secondary/40">
            <Sparkles className="w-4 h-4 text-brand-secondary" />
            <span>Penukaran {selectedReward} berhasil diproses! Cek kupon di dompetmu.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Reward 1 */}
          <div className="p-4 rounded-xl border border-border-subtle hover:border-brand-secondary transition bg-surface-canvas flex justify-between items-center">
            <div>
              <div className="font-bold text-xs text-text-primary">Kupon Diskon Makan Rp 10.000</div>
              <div className="text-[11px] text-text-muted">Berlaku di semua kantin mitra kampus</div>
              <div className="font-bold text-xs text-brand-primary mt-1">300 EcoPoints</div>
            </div>
            <button
              onClick={() => setSelectedReward("Kupon Diskon Makan Rp 10.000")}
              className="bg-brand-primary hover:bg-brand-dark text-white font-bold px-3 py-1.5 rounded-full text-xs transition"
            >
              Tukar
            </button>
          </div>

          {/* Reward 2 */}
          <div className="p-4 rounded-xl border border-border-subtle hover:border-brand-secondary transition bg-surface-canvas flex justify-between items-center">
            <div>
              <div className="font-bold text-xs text-text-primary">Donasi 1 Bibit Pohon Kampus</div>
              <div className="text-[11px] text-text-muted">Ditanam atas namamu di Hutan UI</div>
              <div className="font-bold text-xs text-brand-primary mt-1">500 EcoPoints</div>
            </div>
            <button
              onClick={() => setSelectedReward("Donasi 1 Bibit Pohon Kampus")}
              className="bg-brand-secondary hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-full text-xs transition"
            >
              Donasikan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
