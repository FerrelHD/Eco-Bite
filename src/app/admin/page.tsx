"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Award,
  ShieldCheck,
  TrendingUp,
  Leaf,
  DollarSign,
  LogOut,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Store,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingMerchantId, setUpdatingMerchantId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/admin/login");
          return;
        }
      }
      const resData = await res.json();
      setData(resData);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleChangeTier = async (merchantId: string, greenTier: string) => {
    setUpdatingMerchantId(merchantId);
    try {
      await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, greenTier }),
      });
      fetchAdminData();
    } catch (err) {
      console.error("Update tier error:", err);
    } finally {
      setUpdatingMerchantId(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10 animate-pulse space-y-6">
        <div className="h-16 bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-800 rounded-2xl"></div>
          <div className="h-32 bg-slate-800 rounded-2xl"></div>
          <div className="h-32 bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { metrics, merchants, students, admin } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Admin Dedicated Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0 border border-slate-700">
              <Image src="/icon.svg" alt="EcoBite" width={40} height={40} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white">EcoBite Admin Console</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  SDG 12 Office
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Monitoring Keberlanjutan & Audit Kampus</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block text-xs">
              <div className="font-bold text-white">{admin?.name || "Dr. Siti Rahmawati"}</div>
              <div className="text-slate-400 text-[10px]">Administrator Keberlanjutan Kampus</div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* Top Summary Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-800/40 shadow-2xl">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Universitas Indonesia Zero Food Waste Target</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Capaian ESG & Keberlanjutan Kolektif Kampus
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitoring real-time dampak penyelamatan makanan surplus dari seluruh kantin, kafe, dan bakery fakultas yang terdaftar di ekosistem EcoBite.
            </p>
          </div>
        </div>

        {/* 3 Large Cumulative Impact Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Pangan Terselamatkan
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {metrics.totalFoodWeightRescuedKg.toLocaleString("id-ID")} kg
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Dari {metrics.activeMerchantsCount} gerai kantin aktif
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Leaf className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Reduksi Emisi Karbon (CO2)
              </div>
              <div className="text-3xl font-extrabold text-brand-secondary mt-1">
                {metrics.totalCo2PreventedKg.toLocaleString("id-ID")} kg CO2
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Pencegahan gas metana TPA kampus
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-brand-secondary">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Penghematan Biaya Pangan
              </div>
              <div className="text-3xl font-extrabold text-amber-400 mt-1">
                Rp {metrics.totalMoneySavedRp.toLocaleString("id-ID")}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Diskon langsung dinikmati mahasiswa
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-800 flex items-center justify-center text-amber-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Section 1: Merchant Green Certification Audit */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                <span>Audit & Sertifikasi Kantin Hijau Universitas</span>
              </h3>
              <p className="text-xs text-slate-400">
                Pemberian predikat Level Gold / Silver / Bronze berdasarkan konsistensi penyelamatan pangan.
              </p>
            </div>
            <span className="text-xs text-slate-400">{merchants.length} Gerai Terdaftar</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Nama Gerai & Lokasi</th>
                  <th className="p-3">Fakultas</th>
                  <th className="p-3">Status Operasional</th>
                  <th className="p-3">Level Sertifikasi Hijau</th>
                  <th className="p-3 rounded-r-lg text-right">Ubah Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {merchants.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-white">
                      <div>{m.storeName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{m.location}</div>
                    </td>
                    <td className="p-3 text-slate-300">{m.faculty}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          m.isOpen
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {m.isOpen ? "Menerima Surplus" : "Tutup"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          m.greenTier === "GOLD"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : m.greenTier === "SILVER"
                            ? "bg-slate-500/20 text-slate-300 border border-slate-500/40"
                            : "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                        }`}
                      >
                        Level {m.greenTier}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        disabled={updatingMerchantId === m.id}
                        value={m.greenTier}
                        onChange={(e) => handleChangeTier(m.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                      >
                        <option value="GOLD">Level Gold</option>
                        <option value="SILVER">Level Silver</option>
                        <option value="BRONZE">Level Bronze</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Student SKPI SDG 12 Approvals */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <span>Verifikasi Portofolio SKPI (Surat Keterangan Pendamping Ijazah)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Mahasiswa yang telah mencapai ambang batas 1.000 EcoPoints berhak atas sertifikat pengabdian SDG 12.
              </p>
            </div>
            <span className="text-xs text-slate-400">{students.length} Mahasiswa Aktif</span>
          </div>

          <div className="space-y-3">
            {students.map((st: any) => {
              const eligible = st.ecoPoints >= 1000;
              return (
                <div
                  key={st.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{st.name}</span>
                      <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded">
                        {st.nim}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{st.faculty}</div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                      Saldo: {st.ecoPoints.toLocaleString("id-ID")} EcoPoints
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                    {eligible ? (
                      <span className="bg-emerald-950 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Layak SKPI SDG 12 (Disetujui)</span>
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 font-semibold px-3 py-1 rounded-full">
                        Belum Mencapai 1.000 Poin
                      </span>
                    )}

                    <button
                      onClick={() => alert(`Sertifikat SKPI untuk ${st.name} (${st.nim}) siap diekspor ke SIAK-NG.`)}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-1 rounded-full text-xs transition border border-slate-700"
                    >
                      Audit Berkas
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
