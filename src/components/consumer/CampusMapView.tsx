"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  MapPin,
  Footprints,
  Compass,
  Layers,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";

interface CampusFacility {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  details?: string | null;
}

interface CampusMapViewProps {
  onSelectMerchant: (merchantName: string) => void;
  onNavigateToMarket: () => void;
}

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  onSelectMerchant,
  onNavigateToMarket,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [facilities, setFacilities] = useState<CampusFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<CampusFacility | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch campus facilities from API
  useEffect(() => {
    fetch("/api/facilities")
      .then((res) => res.json())
      .then((data) => {
        if (data.facilities) {
          setFacilities(data.facilities);
          // Set Kulina as default selected
          const defaultKulina = data.facilities.find((f: any) =>
            f.name.includes("Kulina")
          );
          if (defaultKulina) setSelectedFacility(defaultKulina);
        }
      })
      .catch((err) => console.error("Error loading facilities:", err));
  }, []);

  // Initialize Leaflet map on client
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Ensure previous instance is cleaned up to prevent 'Map container is already initialized'
      if ((mapContainerRef.current as any)._leaflet_id) {
        try {
          if (mapInstanceRef.current?.map) {
            mapInstanceRef.current.map.remove();
          }
        } catch (e) {
          console.warn("Leaflet cleanup error:", e);
        }
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Default center: Campus Central
      const campusCenter: [number, number] = [-6.3628, 106.8285];
      const map = L.map(mapContainerRef.current).setView(campusCenter, 16);

      // Clean OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Draw 800m walking radius geofence
      const geofenceCircle = L.circle(campusCenter, {
        radius: 800,
        color: "#2D6A4F",
        fillColor: "#52B788",
        fillOpacity: 0.12,
        weight: 2,
        dashArray: "4, 6",
      }).addTo(map);

      geofenceCircle.bindPopup("<b>Radar Pejalan Kaki Kampus</b><br>Radius 800 m (10 mnt jalan kaki)");

      // Solid user marker without blinking/pulsing animation
      const userMarkerHtml = `
        <div style="width: 20px; height: 20px; border-radius: 50%; background-color: #2D6A4F; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.35);"></div>
      `;

      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: userMarkerHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker(campusCenter, { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Posisi Kamu Sekarang</b><br>Gedung Vokasi / FT UI");

      mapInstanceRef.current = { map, L, markers: [] };
      setMapLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current?.map) {
        try {
          mapInstanceRef.current.map.remove();
        } catch (e) {
          console.warn("Leaflet unmount cleanup error:", e);
        }
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Update facility markers when facilities or filter change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    const { map, L } = mapInstanceRef.current;

    // Clear previous markers
    if (mapInstanceRef.current.markers) {
      mapInstanceRef.current.markers.forEach((m: any) => map.removeLayer(m));
    }
    mapInstanceRef.current.markers = [];

    const filtered =
      filterType === "ALL"
        ? facilities
        : facilities.filter((f) => f.type === filterType);

    filtered.forEach((fac) => {
      let iconColor = "#2D6A4F";
      let iconBg = "#EBFDF3";
      let label = "🍽️";

      if (fac.type === "REUSABLE_DROP") {
        iconColor = "#0284C7";
        iconBg = "#E0F2FE";
        label = "♻️";
      } else if (fac.type === "WATER_STATION") {
        iconColor = "#0D9488";
        iconBg = "#CCFBF1";
        label = "💧";
      } else if (fac.type === "BIKE_PARKING") {
        iconColor = "#F59E0B";
        iconBg = "#FEF3C7";
        label = "🚲";
      }

      const markerHtml = `
        <div style="background-color: ${iconBg}; border: 2px solid ${iconColor}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); cursor: pointer;">
          ${label}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-fac-marker",
        html: markerHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        setSelectedFacility(fac);
        map.panTo([fac.lat, fac.lng], { animate: true, duration: 0.5 });
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong style="color: #2D6A4F;">${fac.name}</strong><br/>
          <span style="color: #64748B;">${fac.details || ""}</span>
        </div>
      `);

      mapInstanceRef.current.markers.push(marker);
    });
  }, [facilities, filterType, mapLoaded]);

  const filterButtons = [
    { id: "ALL", label: "Semua Titik" },
    { id: "SURPLUS_MERCHANT", label: "🍽️ Kantin Surplus" },
    { id: "REUSABLE_DROP", label: "♻️ Drop Wadah Reusable" },
    { id: "WATER_STATION", label: "💧 Water Station" },
    { id: "BIKE_PARKING", label: "🚲 Parkir Sepeda" },
  ];

  return (
    <div className="space-y-4 pb-16">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-card p-4 rounded-xl border border-border-subtle shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-primary" />
            <h2 className="font-bold text-base sm:text-lg text-text-primary">
              Radar & Peta Interaktif Kampus
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
        {/* Map Container */}
        <div className="lg:col-span-2 relative h-[450px] sm:h-[520px] rounded-2xl overflow-hidden border border-border-subtle shadow-card bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Radar Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-brand-primary shadow-sm border border-brand-secondary/30 flex items-center gap-1.5 z-[400]">
            <Compass className="w-3.5 h-3.5 text-brand-secondary" />
            <span>Geofence 800m Aktif</span>
          </div>
        </div>

        {/* Canteen & Facility Drawer Sidebar */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-text-muted">
                Titik Terdekat
              </span>
              <span className="text-[11px] text-brand-primary font-semibold">
                Urut Jarak Pejalan Kaki
              </span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {facilities.map((fac) => {
                const isSelected = selectedFacility?.id === fac.id;
                return (
                  <div
                    key={fac.id}
                    onClick={() => {
                      setSelectedFacility(fac);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.map.panTo([fac.lat, fac.lng], {
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
                  Fasilitas Terpilih
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
};
