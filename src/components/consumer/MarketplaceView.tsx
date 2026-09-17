"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  Clock,
  Sparkles,
  MapPin,
  Leaf,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  X,
  Footprints,
  QrCode,
  CreditCard,
} from "lucide-react";

interface SurplusItem {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  stockQuantity: number;
  pickupStart: string;
  pickupEnd: string;
  byocBonusPoints: number;
  imageUrl: string;
  status: string;
  merchant: {
    id: string;
    storeName: string;
    location: string;
    faculty: string;
    isOpen: boolean;
    isVerified: boolean;
    greenTier: string;
  };
}

interface MarketplaceViewProps {
  searchQuery: string;
  onOrderSuccess: (orderId: string) => void;
  onNavigateToPass: () => void;
  onNavigateToMap: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  searchQuery,
  onOrderSuccess,
  onNavigateToPass,
  onNavigateToMap,
}) => {
  const [items, setItems] = useState<SurplusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedFaculty, setSelectedFaculty] = useState("ALL");

  // Countdown timer for Batch Senja (e.g. ends at 21:00 WIB)
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 28, seconds: 45 });

  // Checkout Modal State
  const [selectedItem, setSelectedItem] = useState<SurplusItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [byocOptIn, setByocOptIn] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "KAMPUSPAY">("QRIS");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccessData, setOrderSuccessData] = useState<any | null>(null);

  // Load surplus items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (selectedFaculty !== "ALL") params.append("faculty", selectedFaculty);
      if (searchQuery) params.append("q", searchQuery);

      const res = await fetch(`/api/surplus?${params.toString()}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to load surplus items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, selectedFaculty, searchQuery]);

  // Live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenCheckout = (item: SurplusItem) => {
    setSelectedItem(item);
    setOrderQuantity(1);
    setByocOptIn(true);
    setOrderError(null);
    setOrderSuccessData(null);
  };

  const handleExecuteCheckout = async () => {
    if (!selectedItem) return;
    setSubmittingOrder(true);
    setOrderError(null);

    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.id,
          quantity: orderQuantity,
          paymentMethod,
          byocOptIn,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOrderError(data.error || "Gagal memproses pemesanan.");
        setSubmittingOrder(false);
        return;
      }

      // Success! Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#2D6A4F", "#52B788", "#EBFDF3", "#F77F00"],
      });

      setOrderSuccessData(data);
      onOrderSuccess(data.order.id);
      fetchItems(); // Refresh catalog stock
    } catch (err: any) {
      setOrderError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const categories = [
    { id: "ALL", label: "✨ Semua Menu" },
    { id: "BAKERY", label: "🥐 Roti & Pastry" },
    { id: "RICE_MAINS", label: "🍚 Nasi & Lauk" },
    { id: "CAFE_COFFEE", label: "☕ Kafe & Kopi" },
    { id: "HEALTHY_SALAD", label: "🥗 Salad Sehat" },
  ];

  const faculties = [
    { id: "ALL", label: "Semua Fakultas" },
    { id: "Vokasi", label: "Vokasi" },
    { id: "FEB", label: "FEB" },
    { id: "Teknik", label: "Teknik" },
    { id: "Pusgiwa", label: "Pusgiwa" },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Section: Campus Impact Banner & Batch Senja Countdown */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-primary via-emerald-800 to-brand-dark text-white p-6 sm:p-8 shadow-card">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-light border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
              <span>Gerakan Zero Food Waste Kampus</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              Selamatkan Makanan Berkualitas, <br />
              <span className="text-brand-secondary">Hemat Hingga 70%</span> Malam Ini.
            </h1>
            <p className="text-slate-200 text-sm leading-relaxed">
              Dukung kantin dan bakery fakultas dengan mengambil surplus makanan sebelum tutup. Dapatkan bonus EcoPoints
              dan kurangi jejak karbon kampusmu.
            </p>

            {/* Collective Impact Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-xs flex items-center gap-2">
                <span className="font-bold text-brand-secondary text-sm">1.420+ kg</span>
                <span className="text-slate-300">Pangan Diselamatkan</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-xs flex items-center gap-2">
                <span className="font-bold text-brand-secondary text-sm">2.130 kg</span>
                <span className="text-slate-300">CO2 Dicegah</span>
              </div>
            </div>
          </div>

          {/* Flash Sale Countdown Card */}
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/20 flex flex-col items-center justify-center min-w-[240px]">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
              <Clock className="w-4 h-4 animate-spin-slow" />
              <span>Batch Senja Berakhir Dalam</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-2xl sm:text-3xl font-bold text-white tracking-widest">
              <span className="bg-black/30 px-2.5 py-1 rounded-md">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-black/30 px-2.5 py-1 rounded-md">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-black/30 px-2.5 py-1 rounded-md text-amber-300">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-2 text-center">
              Waktu penjemputan: 19:30 – 21:00 WIB
            </p>
          </div>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Category Pills */}
        <div className="flex overflow-x-auto space-x-2 pb-1 max-w-full scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap shadow-subtle ${
                selectedCategory === cat.id
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-surface-card hover:bg-slate-100 text-text-muted border border-border-subtle"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Faculty Select Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-text-muted hidden sm:inline">Lokasi:</span>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="bg-surface-card border border-border-subtle rounded-md px-3 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-secondary"
          >
            {faculties.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Surplus Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-surface-card rounded-xl border border-border-subtle p-4 space-y-3 animate-pulse">
              <div className="w-full h-44 bg-slate-200 rounded-lg"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-surface-card rounded-2xl border border-border-subtle p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-brand-light mx-auto flex items-center justify-center text-brand-primary">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-text-primary">Tidak Ada Makanan Ditemukan</h3>
          <p className="text-xs text-text-muted">
            Semua paket surplus di kategori ini mungkin telah diselamatkan atau belum dijadwalkan oleh gerai kantin.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedFaculty("ALL");
            }}
            className="text-xs font-semibold text-brand-primary underline"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const discountPercent = Math.round(
              ((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100
            );

            return (
              <div
                key={item.id}
                className="bg-surface-card rounded-xl border border-border-subtle shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative w-full h-48 overflow-hidden bg-slate-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Urgency Badge */}
                  <div className="absolute top-3 left-3 bg-status-warning text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <span>Tersisa {item.stockQuantity} porsi</span>
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute top-3 right-3 bg-brand-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    Hemat {discountPercent}%
                  </div>

                  {/* BYOC Bonus Pill */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-brand-secondary text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-brand-secondary/30">
                    <Leaf className="w-3 h-3 fill-brand-secondary" />
                    <span>+{item.byocBonusPoints} EcoPoints (Bawa Wadah)</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Merchant & Distance info */}
                    <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                      <div className="flex items-center gap-1 font-medium text-brand-dark">
                        <MapPin className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
                        <span className="truncate max-w-[150px]">{item.merchant.storeName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-text-muted">
                        <Footprints className="w-3 h-3" />
                        <span>400 m • 5 mnt</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-text-primary group-hover:text-brand-primary transition leading-snug">
                      {item.name}
                    </h3>

                    <p className="text-xs text-text-muted line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border-subtle/80">
                    {/* Pickup Time Window */}
                    <div className="flex items-center justify-between text-[11px] text-text-muted bg-surface-canvas px-2.5 py-1.5 rounded-md">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-brand-primary" />
                        <span>Jam Ambil:</span>
                      </span>
                      <span className="font-semibold text-text-primary">
                        {item.pickupStart} – {item.pickupEnd} WIB
                      </span>
                    </div>

                    {/* Price Comparison & CTA */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] text-text-muted line-through">
                          Rp {item.originalPrice.toLocaleString("id-ID")}
                        </div>
                        <div className="font-bold text-lg text-brand-primary">
                          Rp {item.discountedPrice.toLocaleString("id-ID")}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenCheckout(item)}
                        className="bg-brand-primary hover:bg-brand-dark text-white font-semibold text-xs px-4 py-2.5 rounded-full transition shadow-subtle hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Selamatkan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout & Reservation Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-card w-full max-w-md rounded-2xl shadow-card border border-border-subtle overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-brand-light/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-secondary"></span>
                <h3 className="font-bold text-sm sm:text-base text-brand-dark">
                  Konfirmasi Penyelamatan Pangan
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {orderSuccessData ? (
                /* Success State */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto text-brand-primary">
                    <CheckCircle2 className="w-10 h-10 text-brand-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-text-primary">
                      Porsi Berhasil Diamankan!
                    </h4>
                    <p className="text-xs text-text-muted mt-1">
                      Kode Pesanan: <span className="font-mono font-bold text-brand-primary">{orderSuccessData.order.orderNumber}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Silakan datang ke gerai pada pukul {selectedItem.pickupStart} – {selectedItem.pickupEnd} WIB dengan menunjukkan Tiket Pass Anda di kasir.
                    </p>
                  </div>

                  <div className="p-3 bg-brand-light rounded-xl border border-brand-secondary/30 flex items-center justify-center gap-2 text-brand-primary font-semibold text-xs">
                    <Leaf className="w-4 h-4 fill-brand-secondary text-brand-secondary" />
                    <span>+50 EcoPoints aktif saat verifikasi selesai!</span>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(null);
                        onNavigateToPass();
                      }}
                      className="flex-1 bg-brand-primary hover:bg-brand-dark text-white font-bold py-2.5 rounded-full text-xs transition"
                    >
                      Buka Tiket Penyelamatanku
                    </button>
                  </div>
                </div>
              ) : (
                /* Order Form */
                <>
                  {orderError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Gagal Menyimpan Pesanan</div>
                        <div>{orderError}</div>
                      </div>
                    </div>
                  )}

                  {/* Item Summary Card */}
                  <div className="flex gap-3 bg-surface-canvas p-3 rounded-xl border border-border-subtle">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                      <Image
                        src={selectedItem.imageUrl}
                        alt={selectedItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-text-primary text-xs truncate">
                        {selectedItem.name}
                      </div>
                      <div className="text-[11px] text-text-muted">
                        {selectedItem.merchant.storeName} ({selectedItem.merchant.location})
                      </div>
                      <div className="font-bold text-brand-primary text-xs mt-1">
                        Rp {selectedItem.discountedPrice.toLocaleString("id-ID")} / porsi
                      </div>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-border-subtle">
                    <div>
                      <div className="font-semibold text-text-primary text-xs">Jumlah Porsi</div>
                      <div className="text-[10px] text-text-muted">
                        Maksimal {selectedItem.stockQuantity} porsi tersisa
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                        disabled={orderQuantity <= 1}
                        className="w-7 h-7 rounded-md bg-surface-canvas border border-border-subtle font-bold flex items-center justify-center hover:bg-slate-200 disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-xs">{orderQuantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setOrderQuantity(Math.min(selectedItem.stockQuantity, orderQuantity + 1))
                        }
                        disabled={orderQuantity >= selectedItem.stockQuantity}
                        className="w-7 h-7 rounded-md bg-surface-canvas border border-border-subtle font-bold flex items-center justify-center hover:bg-slate-200 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* BYOC (Bring Your Own Container) Switcher */}
                  <div
                    onClick={() => setByocOptIn(!byocOptIn)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 select-none ${
                      byocOptIn
                        ? "bg-brand-light border-brand-secondary/60 text-brand-dark"
                        : "bg-surface-canvas border-border-subtle text-text-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={byocOptIn}
                      onChange={() => {}}
                      className="mt-1 rounded text-brand-primary focus:ring-brand-secondary h-4 w-4"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-brand-secondary fill-brand-secondary" />
                        <span>Bawa Wadah Sendiri (BYOC)</span>
                        <span className="bg-brand-secondary text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
                          +50 Pts
                        </span>
                      </div>
                      <p className="text-[11px] mt-0.5 leading-snug">
                        Saya bersedia membawa wadah makan / tumbler sendiri saat mengambil paket untuk membantu mengurangi sampah kemasan.
                      </p>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <div className="font-semibold text-xs text-text-primary">Metode Pembayaran</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("QRIS")}
                        className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition text-xs ${
                          paymentMethod === "QRIS"
                            ? "border-brand-primary bg-brand-light font-bold text-brand-primary"
                            : "border-border-subtle bg-white text-text-muted"
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-brand-primary" />
                        <div>
                          <div>QRIS Instan</div>
                          <div className="text-[10px] font-normal text-text-muted">Gopay, OVO, BCA</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("KAMPUSPAY")}
                        className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition text-xs ${
                          paymentMethod === "KAMPUSPAY"
                            ? "border-brand-primary bg-brand-light font-bold text-brand-primary"
                            : "border-border-subtle bg-white text-text-muted"
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-brand-primary" />
                        <div>
                          <div>KampusPay</div>
                          <div className="text-[10px] font-normal text-text-muted">Saldo Mahasiswa</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Price Calculation Summary */}
                  <div className="border-t border-border-subtle pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-text-muted">
                      <span>Harga Surplus ({orderQuantity}x)</span>
                      <span>Rp {(selectedItem.discountedPrice * orderQuantity).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-brand-secondary font-medium">
                      <span>Penghematan Kamu</span>
                      <span>
                        -Rp {((selectedItem.originalPrice - selectedItem.discountedPrice) * orderQuantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-text-primary pt-1 border-t border-dashed border-border-subtle">
                      <span>Total Pembayaran</span>
                      <span className="text-brand-primary">
                        Rp {(selectedItem.discountedPrice * orderQuantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="button"
                    onClick={handleExecuteCheckout}
                    disabled={submittingOrder}
                    className="w-full mt-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-full text-xs sm:text-sm transition shadow-subtle flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submittingOrder ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Mengamankan Porsi Surplus...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Bayar & Terbitkan Tiket Pass</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
