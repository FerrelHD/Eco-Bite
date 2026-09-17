"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  Clock,
  MapPin,
  Leaf,
  ShieldCheck,
  Phone,
  Footprints,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

interface ActiveRescuePassViewProps {
  onNavigateToMap: () => void;
  onNavigateToMarket: () => void;
}

export const ActiveRescuePassView: React.FC<ActiveRescuePassViewProps> = ({
  onNavigateToMap,
  onNavigateToMarket,
}) => {
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [countdownMinutes, setCountdownMinutes] = useState(41);
  const [countdownSeconds, setCountdownSeconds] = useState(21);
  const [showContactModal, setShowContactModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Fetch active rescue pass & history
  const fetchPassData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rescue-pass/active");
      const data = await res.json();
      if (data.activeOrder) {
        setActiveOrder(data.activeOrder);

        // Generate dynamic QR Code Data URL from token
        const token =
          data.activeOrder.rescuePass?.dynamicQrToken ||
          `v1.${data.activeOrder.id}.${data.activeOrder.orderNumber}.${Date.now()}.demo.sig`;

        QRCode.toDataURL(token, {
          width: 260,
          margin: 1,
          color: {
            dark: "#1B4332",
            light: "#FFFFFF",
          },
        }).then(setQrDataUrl);
      }
      if (data.history) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to load pass:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassData();
  }, []);

  // Live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((sec) => {
        if (sec > 0) return sec - 1;
        setCountdownMinutes((min) => (min > 0 ? min - 1 : 0));
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDownloadInvoice = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
          Tiket & Penyelamatanku
        </h2>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Tunjukkan QR Code dinamis ini kepada kasir saat mengambil paket surplus di gerai.
        </p>
      </div>

      {loading ? (
        <div className="max-w-md mx-auto bg-surface-card rounded-2xl p-8 border border-border-subtle shadow-card animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto"></div>
          <div className="w-48 h-48 bg-slate-200 rounded-xl mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
        </div>
      ) : activeOrder ? (
        <div className="max-w-md mx-auto">
          {/* Apple Pass-Style Ticket Card */}
          <div className="relative bg-white rounded-3xl shadow-card border border-border-subtle overflow-hidden">
            {/* Ticket Header (Forest Green) */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-dark text-white p-5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-brand-secondary">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Surplus Rescue Pass</span>
                </div>
                <span className="bg-brand-secondary/30 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px] border border-brand-secondary/40">
                  {activeOrder.orderNumber}
                </span>
              </div>

              <div className="pt-2">
                <h3 className="text-lg font-bold">{activeOrder.merchant.storeName}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-secondary" />
                  {activeOrder.merchant.location}
                </p>
              </div>
            </div>

            {/* Countdown Banner */}
            <div className="bg-amber-50 border-y border-amber-200/80 px-5 py-2.5 flex items-center justify-between text-xs text-amber-900 font-semibold">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-status-warning" />
                <span>Batas Waktu Pengambilan:</span>
              </div>
              <div className="font-mono text-sm font-bold text-status-warning">
                {String(countdownMinutes).padStart(2, "0")}:{String(countdownSeconds).padStart(2, "0")} mnt
              </div>
            </div>

            {/* Tear-off Perforation Divider with Half-Circle Cutouts */}
            <div className="relative py-2 bg-white flex items-center">
              <div className="ticket-cutout-left border-r border-border-subtle"></div>
              <div className="w-full border-t-2 border-dashed border-slate-300 mx-4"></div>
              <div className="ticket-cutout-right border-l border-border-subtle"></div>
            </div>

            {/* Dynamic QR Code Section */}
            <div className="p-6 text-center space-y-3 bg-white">
              <div className="inline-block p-3 rounded-2xl bg-surface-canvas border-2 border-brand-primary/20 shadow-sm relative group">
                {qrDataUrl ? (
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto">
                    <Image
                      src={qrDataUrl}
                      alt="Dynamic QR Code"
                      fill
                      className="object-contain"
                    />
                    {/* Center Brand Emblem */}
                    <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center shadow-md border-2 border-white pointer-events-none">
                      <Leaf className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-text-muted">
                    Membuat QR Kriptografis...
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-brand-dark flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-secondary" />
                  <span>QR Code Dinamis (Tanda Tangan HMAC-SHA256)</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Otomatis diperbarui untuk mencegah pemalsuan tiket tangkapan layar.
                </p>
              </div>

              {/* Order Item Summary Pill */}
              <div className="bg-surface-canvas rounded-xl p-3 border border-border-subtle text-left text-xs space-y-1 mt-2">
                <div className="flex justify-between font-bold text-text-primary">
                  <span>{activeOrder.item.name}</span>
                  <span className="text-brand-primary">Rp {activeOrder.totalPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-text-muted text-[11px]">
                  <span>Porsi: {activeOrder.quantity}x • Jam: {activeOrder.item.pickupStart} - {activeOrder.item.pickupEnd} WIB</span>
                  <span className="text-status-success font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Lunas {activeOrder.paymentMethod}
                  </span>
                </div>
              </div>

              {/* BYOC Reminder Box */}
              {activeOrder.byocOptIn && (
                <div className="bg-brand-light rounded-xl p-3 border border-brand-secondary/40 text-left text-xs flex items-start gap-2 text-brand-dark">
                  <Leaf className="w-4 h-4 text-brand-secondary fill-brand-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pengingat Aksi Hijau (BYOC):</span> Bawa wadah makan / tumbler sendiri saat mengambil pesanan untuk klaim <strong>+50 EcoPoints</strong> di kasir!
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={onNavigateToMap}
                  className="bg-brand-light hover:bg-emerald-100 text-brand-primary font-bold py-2.5 px-3 rounded-full text-xs flex items-center justify-center gap-1.5 transition border border-brand-secondary/30"
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Rute Jalan Kaki</span>
                </button>

                <button
                  onClick={() => setShowContactModal(true)}
                  className="bg-surface-canvas hover:bg-slate-200 text-text-primary font-bold py-2.5 px-3 rounded-full text-xs flex items-center justify-center gap-1.5 transition border border-border-subtle"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Hubungi Kantin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="max-w-md mx-auto bg-surface-card rounded-2xl p-8 border border-border-subtle text-center space-y-4 shadow-card">
          <div className="w-14 h-14 bg-brand-light rounded-full flex items-center justify-center mx-auto text-brand-primary">
            <Leaf className="w-7 h-7 text-brand-secondary" />
          </div>
          <div>
            <h3 className="font-bold text-base text-text-primary">Tidak Ada Tiket Penyelamatan Aktif</h3>
            <p className="text-xs text-text-muted mt-1">
              Kamu belum memesan surplus makanan malam ini. Pilih paket lezat dari katalog sekarang!
            </p>
          </div>
          <button
            onClick={onNavigateToMarket}
            className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2.5 px-6 rounded-full text-xs transition shadow-subtle inline-flex items-center gap-2"
          >
            <span>Buka Katalog Makanan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rescue History Section */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-border-subtle pb-3">
          <div>
            <h3 className="font-bold text-base text-text-primary">Riwayat Penyelamatan Pangan</h3>
            <p className="text-xs text-text-muted">Jejak kontribusi makanan yang berhasil kamu selamatkan sebelumnya.</p>
          </div>
          <button
            onClick={handleDownloadInvoice}
            className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Laporan Dampak</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-brand-light text-brand-primary rounded-lg text-xs font-semibold flex items-center gap-2 border border-brand-secondary/30">
            <CheckCircle2 className="w-4 h-4 text-brand-secondary" />
            <span>Invoice & Sertifikat Dampak Digital berhasil diunduh (PDF Simulated)!</span>
          </div>
        )}

        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-6 text-xs text-text-muted">
              Belum ada riwayat transaksi selesai.
            </div>
          ) : (
            history.map((order) => (
              <div
                key={order.id}
                className="bg-surface-canvas p-4 rounded-xl border border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-text-primary">{order.item.name}</span>
                    <span className="bg-white text-brand-primary font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-border-subtle">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    {order.merchant.storeName} • {new Date(order.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </div>

                  {/* Impact pill */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-brand-light text-brand-primary text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-brand-secondary" />
                      +{order.impactLog?.pointsAwarded || 100} Poin
                    </span>
                    <span className="text-[11px] text-brand-secondary font-medium">
                      Hemat Rp {((order.item.originalPrice - order.item.discountedPrice) * order.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="text-right self-end sm:self-auto">
                  <div className="font-bold text-sm text-brand-primary">
                    Rp {order.totalPrice.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[10px] text-status-success font-semibold flex items-center gap-1 justify-end mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Selesai Diambil
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Direct Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-card">
            <div className="flex items-center gap-2 text-brand-primary">
              <Phone className="w-5 h-5" />
              <h4 className="font-bold text-sm">Hubungi Pengelola Kantin</h4>
            </div>
            <p className="text-xs text-text-muted">
              Punya pertanyaan seputar lokasi pengambilan atau konfirmasi pesanan darurat?
            </p>
            <div className="bg-surface-canvas p-3 rounded-xl border border-border-subtle text-xs space-y-1.5">
              <div className="font-bold text-text-primary">Kulina Bakery & Pastry</div>
              <div className="text-text-muted">Gedung Vokasi Lantai 1, Unit K-04</div>
              <div className="text-brand-primary font-semibold">WhatsApp: +62 812-9988-7766</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 rounded-full text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
