"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Compass,
  Footprints,
  ShoppingBag,
  Navigation,
  MapPin,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

interface CampusFacility {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  details?: string | null;
}

interface CampusMapCoreProps {
  onSelectMerchant: (merchantName: string) => void;
  onNavigateToMarket: () => void;
}

export default function CampusMapCore({
  onSelectMerchant,
  onNavigateToMarket,
}: CampusMapCoreProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [facilities, setFacilities] = useState<CampusFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<CampusFacility | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  // Campus coordinates: Center of Campus (Universitas Indonesia / Campus Central)
  const campusCenter: [number, number] = [-6.3628, 106.8285];

  // Fetch facilities
  useEffect(() => {
    fetch("/api/facilities")
      .then((res) => res.json())
      .then((data) => {
        if (data.facilities) {
          setFacilities(data.facilities);
          const defaultKulina = data.facilities.find((f: any) =>
            f.name.includes("Kulina")
          );
          if (defaultKulina) setSelectedFacility(defaultKulina);
        }
      })
      .catch((err) => console.error("Error loading facilities:", err));
  }, []);

  // Initialize map once container is mounted
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: campusCenter,
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    // Tile Layer: High-performance OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // 800m Geofence Radar Walking Circle
    const geofenceCircle = L.circle(campusCenter, {
      radius: 800,
      color: "#2D6A4F",
      weight: 2,
      dashArray: "6, 8",
      fillColor: "#52B788",
      fillOpacity: 0.12,
    }).addTo(map);

    geofenceCircle.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
        <strong style="color: #2D6A4F;">Radar Pejalan Kaki 800m</strong><br/>
        <span style="color: #64748B;">Radius jangkauan ~10 menit jalan kaki mahasiswa dari pusat kampus.</span>
      </div>
    `);

    // Solid Center User Marker ("Kamu di Sini")
    const userMarkerHtml = `
      <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #2D6A4F; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; border-radius: 50%; background-color: white;"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: "ecobite-user-marker",
      html: userMarkerHtml,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    L.marker(campusCenter, { icon: userIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong style="color: #2D6A4F;">📍 Posisi Kamu Sekarang</strong><br/>
          <span style="color: #64748B;">Kawasan Kampus Terverifikasi UI</span>
        </div>
      `);

    // Invalidate size after render to fix tile alignment
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when facilities or filter change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const filtered =
      filterType === "ALL"
        ? facilities
        : facilities.filter((f) => f.type === filterType);

    filtered.forEach((fac) => {
      let iconColor = "#2D6A4F";
      let iconBg = "#EBFDF3";
      let label = "🍽️";
      let badgeText = "Kantin";

      if (fac.type === "REUSABLE_DROP") {
        iconColor = "#0284C7";
        iconBg = "#E0F2FE";
        label = "♻️";
        badgeText = "Drop Box";
      } else if (fac.type === "WATER_STATION") {
        iconColor = "#0D9488";
        iconBg = "#CCFBF1";
        label = "💧";
        badgeText = "Water Refill";
      } else if (fac.type === "BIKE_PARKING") {
        iconColor = "#F59E0B";
        iconBg = "#FEF3C7";
        label = "🚲";
        badgeText = "Parkir";
      }

      const markerHtml = `
        <div style="background-color: ${iconBg}; border: 2px solid ${iconColor}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.18); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
          ${label}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-fac-marker",
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        setSelectedFacility(fac);
        map.panTo([fac.lat, fac.lng], { animate: true, duration: 0.5 });
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; min-width: 160px;">
          <div style="font-weight: bold; color: ${iconColor}; font-size: 13px;">${fac.name}</div>
          <div style="color: #64748B; margin-top: 3px; font-size: 11px;">${fac.details || ""}</div>
          <div style="display: inline-block; margin-top: 6px; background-color: ${iconBg}; color: ${iconColor}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
            ${badgeText}
          </div>
        </div>
      `);

      markersRef.current.push(marker);
    });
  }, [facilities, filterType]);

  const filterButtons = [
    { id: "ALL", label: "Semua Fasilitas" },
    { id: "SURPLUS_MERCHANT", label: "🍽️ Kantin Surplus" },
    { id: "REUSABLE_DROP", label: "♻️ Drop Box Wadah" },
    { id: "WATER_STATION", label: "💧 Water Station" },
    { id: "BIKE_PARKING", label: "🚲 Parkir Sepeda" },
  ];

  const handleCenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setView(campusCenter, 16, { animate: true });
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-primary" />
            <h2 className="font-bold text-base sm:text-lg text-text-primary">
              Radar & Peta Kampus Interaktif
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Geofence radius 800 meter pejalan kaki dari lokasi mahasiswa saat ini.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex overflow-x-auto space-x-1.5 scrollbar-none w-full sm:w-auto">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                filterType === btn.id
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-surface-canvas text-text-muted hover:bg-slate-200 border border-border-subtle"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Interactive Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map Viewport Container */}
        <div className="lg:col-span-2 relative h-[450px] sm:h-[540px] rounded-2xl overflow-hidden border border-border-subtle shadow-card bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Controls Overlay */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-brand-primary shadow-sm border border-brand-secondary/30 flex items-center gap-1.5 z-[400]">
            <Compass className="w-3.5 h-3.5 text-brand-secondary" />
            <span>Geofence 800m Aktif</span>
          </div>

          <button
            onClick={handleCenterMap}
            className="absolute bottom-4 right-4 bg-white hover:bg-slate-100 text-brand-primary p-2.5 rounded-xl shadow-md border border-border-subtle z-[400] transition flex items-center gap-1.5 text-xs font-bold"
            title="Pusatkan ke Posisi Kamu"
          >
            <Navigation className="w-4 h-4 text-brand-secondary" />
            <span className="hidden sm:inline">Pusat Kampus</span>
          </button>
        </div>

        {/* Canteen & Facility Drawer Sidebar */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-text-muted">
                Titik Fasilitas Kampus
              </span>
              <span className="text-[11px] text-brand-primary font-semibold">
                Urut Pejalan Kaki
              </span>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {facilities.map((fac) => {
                const isSelected = selectedFacility?.id === fac.id;
                return (
                  <div
                    key={fac.id}
                    onClick={() => {
                      setSelectedFacility(fac);
                      if (mapRef.current) {
                        mapRef.current.panTo([fac.lat, fac.lng], {
                          animate: true,
                        });
                      }
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "bg-brand-light border-brand-secondary shadow-sm"
                        : "bg-surface-canvas hover:bg-slate-100 border-border-subtle"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-xs text-text-primary">{fac.name}</div>
                      <span className="text-[10px] font-semibold text-brand-primary bg-white px-2 py-0.5 rounded-full border border-border-subtle">
                        {fac.type === "SURPLUS_MERCHANT"
                          ? "Kantin"
                          : fac.type === "REUSABLE_DROP"
                          ? "Wadah"
                          : fac.type === "WATER_STATION"
                          ? "Air"
                          : "Sepeda"}
                      </span>
                    </div>

                    <div className="text-[11px] text-text-muted mt-1">{fac.details}</div>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted pt-2 border-t border-border-subtle/50">
                      <span className="flex items-center gap-1 font-medium text-brand-dark">
                        <Footprints className="w-3 h-3 text-brand-secondary" />
                        400m (5 mnt jalan kaki)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Highlight Card */}
          {selectedFacility && (
            <div className="bg-gradient-to-br from-brand-primary to-brand-dark text-white p-4 rounded-2xl shadow-card flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-brand-secondary">
                  Titik Terpilih di Peta
                </div>
                <div className="font-bold text-sm truncate max-w-[200px]">
                  {selectedFacility.name}
                </div>
                <div className="text-xs text-slate-200 mt-0.5">
                  {selectedFacility.details}
                </div>
              </div>

              {selectedFacility.type === "SURPLUS_MERCHANT" && (
                <button
                  onClick={onNavigateToMarket}
                  className="bg-brand-secondary hover:bg-emerald-400 text-brand-dark px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Lihat Menu</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
