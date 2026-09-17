"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  Store,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Leaf,
  Plus,
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Check,
  X,
  Camera,
  RefreshCw,
} from "lucide-react";

interface MerchantData {
  id: string;
  storeName: string;
  location: string;
  faculty: string;
  isOpen: boolean;
  greenTier: string;
  items: any[];
}

interface KPIs {
  portionsSoldToday: number;
  additionalRevenueToday: number;
  wastePreventedKg: number;
}

export const MerchantDashboard: React.FC = () => {
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Store Operational Toggle
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [togglingStore, setTogglingStore] = useState(false);

  // POS Validation State
  const [ticketInput, setTicketInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [validatedOrder, setValidatedOrder] = useState<any | null>(null);
  const [posError, setPosError] = useState<string | null>(null);
  const [posSuccess, setPosSuccess] = useState<string | null>(null);
  const [verifyByocChecked, setVerifyByocChecked] = useState(true);
  const [simulatedScannerActive, setSimulatedScannerActive] = useState(false);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemCat, setNewItemCat] = useState("BAKERY");
  const [newItemOrigPrice, setNewItemOrigPrice] = useState("35000");
  const [newItemDiscPrice, setNewItemDiscPrice] = useState("15000");
  const [newItemStock, setNewItemStock] = useState("4");
  const [addingItem, setAddingItem] = useState(false);

  const fetchMerchantOps = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/merchant/ops");
      const data = await res.json();
      if (data.merchant) {
        setMerchant(data.merchant);
        setIsStoreOpen(data.merchant.isOpen);
        setKpis(data.kpis);
        setItems(data.items || []);
        setQueue(data.queue || []);
      }
    } catch (err) {
      console.error("Failed to load merchant ops:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantOps();
  }, []);

  // Toggle Store Status
  const handleToggleStoreStatus = async () => {
    setTogglingStore(true);
    try {
      const nextStatus = !isStoreOpen;
      const res = await fetch("/api/merchant/ops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: nextStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsStoreOpen(nextStatus);
      }
    } catch (err) {
      console.error("Failed to toggle store:", err);
    } finally {
      setTogglingStore(false);
    }
  };

  // POS: Lookup Ticket by Code
  const handleSearchTicket = async (codeToSearch?: string) => {
    const code = codeToSearch || ticketInput;
    if (!code) return;
    setVerifying(true);
    setPosError(null);
    setPosSuccess(null);
    setValidatedOrder(null);

    try {
      const res = await fetch("/api/rescue-pass/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCode: code,
          action: "preview",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPosError(data.error || "Tiket tidak ditemukan.");
        return;
      }

      setValidatedOrder(data.order);
      setVerifyByocChecked(Boolean(data.order.byocOptIn));
    } catch (err: any) {
      setPosError(err.message || "Gagal menghubungkan ke server validasi.");
    } finally {
      setVerifying(false);
    }
  };

  // POS: Confirm Handover
  const handleConfirmRedemption = async () => {
    if (!validatedOrder) return;
    setVerifying(true);
    setPosError(null);

    try {
      const res = await fetch("/api/rescue-pass/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCode: validatedOrder.orderNumber,
          action: "confirm",
          byocVerified: verifyByocChecked,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPosError(data.error || "Gagal mengonfirmasi penyerahan makanan.");
        return;
      }

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#2D6A4F", "#52B788", "#F77F00"],
      });

      setPosSuccess(
        `Makanan diserahkan! +${data.pointsAwarded} EcoPoints dicairkan ke mahasiswa (${validatedOrder.user.name}).`
      );
      setValidatedOrder(null);
      setTicketInput("");
      fetchMerchantOps(); // Refresh KPIs & Queue
    } catch (err: any) {
      setPosError(err.message || "Kesalahan jaringan saat konfirmasi.");
    } finally {
      setVerifying(false);
    }
  };

  // Add Surplus Item
  const handleCreateSurplusItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingItem(true);
    try {
      const res = await fetch("/api/merchant/ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName,
          description: newItemDesc,
          category: newItemCat,
          originalPrice: newItemOrigPrice,
          discountedPrice: newItemDiscPrice,
          stockQuantity: newItemStock,
          pickupStart: "19:30",
          pickupEnd: "21:00",
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewItemName("");
        setNewItemDesc("");
        fetchMerchantOps();
      }
    } catch (err) {
      console.error("Failed to add item:", err);
    } finally {
      setAddingItem(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-pulse">
        <div className="h-32 bg-surface-card rounded-2xl border border-border-subtle"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-surface-card rounded-xl"></div>
          <div className="h-28 bg-surface-card rounded-xl"></div>
          <div className="h-28 bg-surface-card rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Store Header & Operational Toggle */}
      <div className="bg-surface-card rounded-3xl p-6 border border-border-subtle shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-light border border-brand-secondary/30 flex items-center justify-center text-brand-primary shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text-primary">
                {merchant?.storeName || "Kulina Bakery & Pastry"}
              </h2>
              <span className="bg-brand-light text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-secondary/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-brand-secondary" />
                Mitra Terverifikasi Kampus
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Level Gold
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {merchant?.location || "Gedung Vokasi Lt. 1"} • Fakultas {merchant?.faculty || "Vokasi"}
            </p>
          </div>
        </div>

        {/* Operational Toggle Switch */}
        <div className="flex items-center gap-3 bg-surface-canvas p-2.5 rounded-2xl border border-border-subtle self-stretch md:self-auto justify-between md:justify-start">
          <div className="text-xs">
            <div className="font-bold text-text-primary">Menerima Pengambilan Surplus</div>
            <div className="text-[10px] text-text-muted">
              {isStoreOpen ? "Status: Gerai Terbuka (Katalog Aktif)" : "Status: Gerai Tutup"}
            </div>
          </div>

          <button
            onClick={handleToggleStoreStatus}
            disabled={togglingStore}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none flex items-center ${
              isStoreOpen ? "bg-brand-primary" : "bg-slate-300"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                isStoreOpen ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3 Real-Time KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Portions Sold */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Porsi Terjual Hari Ini
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-primary mt-1">
              {kpis?.portionsSoldToday || 18} Porsi
            </div>
            <div className="text-[11px] text-brand-secondary font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>100% dari target surplus terselamatkan</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
            <Store className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Additional Revenue */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Pendapatan Tambahan
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-1">
              Rp {(kpis?.additionalRevenueToday || 285000).toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              Monetisasi surplus bahan baku
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-brand-secondary">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Waste Prevented */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Makanan Tercegah Terbuang
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-secondary mt-1">
              {kpis?.wastePreventedKg || 7.2} kg
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              Cegah emisi gas metana di TPA kampus
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
            <Leaf className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* POS Point of Redemption & Ticket Scanner Engine */}
      <div className="bg-surface-card rounded-3xl p-6 border border-border-subtle shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-base sm:text-lg text-text-primary">
                Mesin Validasi Tiket Kasir (Point of Redemption)
              </h3>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Pindai QR Code dinamis mahasiswa atau ketik kode tiket 5-digit (misal: #EB-88492) untuk verifikasi instan.
            </p>
          </div>

          <button
            onClick={() => setSimulatedScannerActive(!simulatedScannerActive)}
            className="bg-surface-canvas hover:bg-slate-200 text-brand-primary font-bold px-3 py-1.5 rounded-full text-xs transition border border-border-subtle flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{simulatedScannerActive ? "Matikan Kamera Web" : "Nyalakan Kamera Web"}</span>
          </button>
        </div>

        {/* Simulated Camera Viewfinder */}
        {simulatedScannerActive && (
          <div className="bg-black/90 rounded-2xl p-6 text-white text-center space-y-3 relative overflow-hidden border-2 border-brand-secondary">
            <div className="w-48 h-48 border-2 border-dashed border-brand-secondary/80 rounded-2xl mx-auto flex items-center justify-center relative">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-brand-secondary animate-pulse"></div>
              <span className="text-[11px] text-slate-300">Arahkan QR Mahasiswa ke Sini</span>
            </div>
            <p className="text-xs text-slate-300">
              Kamera siap. Untuk simulasi cepat, gunakan pencarian kode tiket manual di bawah ini.
            </p>
          </div>
        )}

        {/* Manual Input Search Bar */}
        <div className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Ketik kode tiket e.g. #EB-88492..."
              className="w-full pl-9 pr-4 py-2.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-secondary text-xs sm:text-sm font-mono"
            />
          </div>
          <button
            onClick={() => handleSearchTicket()}
            disabled={verifying || !ticketInput}
            className="bg-brand-primary hover:bg-brand-dark text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-subtle disabled:opacity-50 flex items-center gap-1.5"
          >
            {verifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Cari Tiket</span>
          </button>
        </div>

        {/* Quick Demo Test Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-text-muted">Coba Kode Demo:</span>
          <button
            onClick={() => {
              setTicketInput("#EB-88492");
              handleSearchTicket("#EB-88492");
            }}
            className="bg-brand-light text-brand-primary font-mono font-bold px-2 py-1 rounded border border-brand-secondary/30 hover:bg-emerald-100 transition"
          >
            #EB-88492 (Pesanan Aktif Rian)
          </button>
        </div>

        {/* Error / Success Feedback */}
        {posError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{posError}</span>
          </div>
        )}

        {posSuccess && (
          <div className="p-3 bg-brand-light border border-brand-secondary/40 text-brand-primary rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-brand-secondary shrink-0" />
            <span>{posSuccess}</span>
          </div>
        )}

        {/* Student Ticket Verification Card */}
        {validatedOrder && (
          <div className="bg-surface-canvas rounded-2xl p-5 border-2 border-brand-secondary/40 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border-subtle pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-base">
                  {validatedOrder.user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-text-primary">
                    {validatedOrder.user.name}
                  </div>
                  <div className="text-xs text-text-muted">
                    NIM: {validatedOrder.user.nim || "2206819283"} • {validatedOrder.user.faculty || "FT UI"}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="bg-status-success text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Lunas ({validatedOrder.paymentMethod})</span>
                </div>
                <div className="font-mono text-xs font-bold text-text-muted mt-0.5">
                  {validatedOrder.orderNumber}
                </div>
              </div>
            </div>

            {/* Item details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-border-subtle">
                <span className="text-text-muted text-[11px]">Paket Pesanan:</span>
                <div className="font-bold text-text-primary mt-0.5">{validatedOrder.item.name}</div>
                <div className="text-brand-primary font-semibold mt-1">
                  {validatedOrder.quantity} Porsi • Rp {validatedOrder.totalPrice.toLocaleString("id-ID")}
                </div>
              </div>

              {/* BYOC Checkbox */}
              <div
                onClick={() => setVerifyByocChecked(!verifyByocChecked)}
                className={`p-3 rounded-xl border cursor-pointer select-none transition flex items-start gap-2.5 ${
                  verifyByocChecked
                    ? "bg-brand-light border-brand-secondary text-brand-dark"
                    : "bg-white border-border-subtle text-text-muted"
                }`}
              >
                <input
                  type="checkbox"
                  checked={verifyByocChecked}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-brand-primary focus:ring-brand-secondary h-4 w-4"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-brand-secondary fill-brand-secondary" />
                    <span>Verifikasi Wadah Sendiri (BYOC)</span>
                  </div>
                  <div className="text-[11px] mt-0.5">
                    Mahasiswa membawa wadah/tumbler sendiri. Berikan bonus <strong>+50 EcoPoints</strong>.
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Handover Button */}
            <button
              onClick={handleConfirmRedemption}
              disabled={verifying}
              className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-full text-xs sm:text-sm transition shadow-subtle flex items-center justify-center gap-2"
            >
              {verifying ? (
                <span>Memproses Verifikasi...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-brand-secondary" />
                  <span>Konfirmasi Penyerahan Makanan (1-Klik)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Listing Management Section */}
      <div className="bg-surface-card rounded-3xl p-6 border border-border-subtle shadow-card space-y-4">
        <div className="flex justify-between items-center border-b border-border-subtle pb-3">
          <div>
            <h3 className="font-bold text-base text-text-primary">
              Manajemen Listing Paket Surplus
            </h3>
            <p className="text-xs text-text-muted">
              Atur stok harian paket mystery bag dan menu yang siap diselamatkan malam ini.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-brand-primary hover:bg-brand-dark text-white font-bold px-4 py-2 rounded-full text-xs transition shadow-subtle flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Paket</span>
          </button>
        </div>

        {/* Listings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-canvas text-text-muted uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-lg">Nama Paket</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Sisa Porsi</th>
                <th className="p-3">Harga Diskon</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-lg text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-canvas/50 transition">
                  <td className="p-3 font-semibold text-text-primary">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-secondary"></span>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-text-muted">{item.category}</td>
                  <td className="p-3 font-bold text-brand-primary">{item.stockQuantity} porsi</td>
                  <td className="p-3 font-semibold text-brand-dark">
                    Rp {item.discountedPrice.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.stockQuantity > 0
                          ? "bg-brand-light text-brand-primary"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {item.stockQuantity > 0 ? "Tersedia" : "Habis"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => alert(`Stok ${item.name} siap diperbarui.`)}
                      className="text-brand-primary hover:underline font-semibold"
                    >
                      Ubah Stok
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Pickup Queue Feed */}
      <div className="bg-surface-card rounded-3xl p-6 border border-border-subtle shadow-card space-y-4">
        <div className="flex justify-between items-center border-b border-border-subtle pb-3">
          <div>
            <h3 className="font-bold text-base text-text-primary">
              Antrean Penjemputan Real-Time (Live Queue)
            </h3>
            <p className="text-xs text-text-muted">
              Monitoring mahasiswa yang telah memesan dan menuju gerai untuk penjemputan.
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] text-brand-secondary font-semibold bg-brand-light px-2.5 py-0.5 rounded-full border border-brand-secondary/30">
            <RefreshCw className="w-3 h-3 text-brand-secondary" />
            <span>Live Sync Aktif</span>
          </span>
        </div>

        <div className="space-y-2">
          {queue.length === 0 ? (
            <div className="text-center py-6 text-xs text-text-muted">
              Belum ada antrean penjemputan baru.
            </div>
          ) : (
            queue.map((q) => (
              <div
                key={q.id}
                className="bg-surface-canvas p-3.5 rounded-xl border border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-light text-brand-primary flex items-center justify-center font-bold text-xs">
                    {q.user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                      <span>{q.user.name}</span>
                      <span className="font-mono text-[10px] text-text-muted">({q.orderNumber})</span>
                    </div>
                    <div className="text-[11px] text-text-muted">
                      {q.item.name} • {q.quantity} porsi
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      q.orderStatus === "COMPLETED"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-status-warning text-white"
                    }`}
                  >
                    {q.orderStatus === "COMPLETED" ? "Sudah Diambil" : "Sedang Menuju Gerai"}
                  </span>
                  {q.orderStatus !== "COMPLETED" && (
                    <button
                      onClick={() => {
                        setTicketInput(q.orderNumber);
                        handleSearchTicket(q.orderNumber);
                      }}
                      className="bg-brand-primary hover:bg-brand-dark text-white font-bold px-3 py-1 rounded-full text-[11px] transition"
                    >
                      Validasi
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-card w-full max-w-md rounded-2xl shadow-card border border-border-subtle overflow-hidden">
            <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-brand-light/50">
              <h4 className="font-bold text-sm text-brand-dark">Tambah Paket Surplus Baru</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSurplusItem} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-text-primary block mb-1">Nama Paket</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Paket Senja Croissant Combo"
                  className="w-full p-2 bg-surface-canvas rounded-lg border border-border-subtle focus:ring-1 focus:ring-brand-secondary"
                />
              </div>

              <div>
                <label className="font-semibold text-text-primary block mb-1">Deskripsi Isi Paket</label>
                <textarea
                  required
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="e.g. 2x butter croissant + 1x cinnamon roll segar panggang hari ini."
                  className="w-full p-2 bg-surface-canvas rounded-lg border border-border-subtle focus:ring-1 focus:ring-brand-secondary h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Kategori</label>
                  <select
                    value={newItemCat}
                    onChange={(e) => setNewItemCat(e.target.value)}
                    className="w-full p-2 bg-surface-canvas rounded-lg border border-border-subtle"
                  >
                    <option value="BAKERY">Roti & Pastry</option>
                    <option value="RICE_MAINS">Nasi & Lauk</option>
                    <option value="CAFE_COFFEE">Kafe & Kopi</option>
                    <option value="HEALTHY_SALAD">Salad Sehat</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Jumlah Porsi</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    className="w-full p-2 bg-surface-canvas rounded-lg border border-border-subtle"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Harga Asli (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newItemOrigPrice}
                    onChange={(e) => setNewItemOrigPrice(e.target.value)}
                    className="w-full p-2 bg-surface-canvas rounded-lg border border-border-subtle"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Harga Diskon (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newItemDiscPrice}
                    onChange={(e) => setNewItemDiscPrice(e.target.value)}
                    className="w-full p-2 bg-surface-canvas rounded-lg border border-border-subtle"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-surface-canvas hover:bg-slate-200 text-text-primary font-bold py-2 rounded-full transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addingItem}
                  className="flex-1 bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 rounded-full transition shadow-subtle"
                >
                  {addingItem ? "Menyimpan..." : "Publikasikan Paket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
