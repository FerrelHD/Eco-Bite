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
  Crosshair,
  LocateFixed,
  AlertCircle,
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

// Haversine distance calculator in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export default function CampusMapCore({
  onSelectMerchant,
  onNavigateToMarket,
}: CampusMapCoreProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);

  // Default campus coordinates (Universitas Indonesia)
  const defaultCampusCenter: [number, number] = [-6.3628, 106.8285];

  const [facilities, setFacilities] = useState<CampusFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<CampusFacility | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [userLocation, setUserLocation] = useState<[number, number]>(defaultCampusCenter);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [detectingGps, setDetectingGps] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Fetch facilities
  const loadFacilities = (centerLat: number, centerLng: number, isRealLocation: boolean) => {
    fetch("/api/facilities")
      .then((res) => res.json())
      .then((data) => {
        if (data.facilities) {
          let list = data.facilities as CampusFacility[];

          // If real location is far from default campus (> 5 km), dynamically anchor facilities around user's real GPS
          const distToDefault = getDistanceMeters(centerLat, centerLng, defaultCampusCenter[0], defaultCampusCenter[1]);
          if (isRealLocation && distToDefault > 5000) {
            list = [
              {
                id: "fac_local_1",
                name: "Kulina Bakery & Pastry (Mitra Terdekat)",
                type: "SURPLUS_MERCHANT",
                lat: centerLat + 0.0022,
                lng: centerLng + 0.0018,
                details: "Buka 19:30 - 21:00 • Sisa 9 porsi (Surplus Hari Ini)",
              },
              {
                id: "fac_local_2",
                name: "Kantin Pusat Kampus (Paket Rice Bowl)",
                type: "SURPLUS_MERCHANT",
                lat: centerLat - 0.0019,
                lng: centerLng + 0.0025,
                details: "Buka 19:00 - 20:30 • Sisa 4 porsi",
              },
              {
                id: "fac_local_3",
                name: "Kafe & Salad Sehat (Detox Bar)",
                type: "SURPLUS_MERCHANT",
                lat: centerLat + 0.0031,
                lng: centerLng - 0.0022,
                details: "Buka 20:00 - 21:30 • Sisa 3 porsi",
              },
              {
                id: "fac_local_4",
                name: "Drop Box Wadah Reusable (BYOC)",
                type: "REUSABLE_DROP",
                lat: centerLat + 0.0012,
                lng: centerLng - 0.0015,
                details: "Titik drop pengembalian kotak makan ramah lingkungan",
              },
              {
                id: "fac_local_5",
                name: "Water Station Refill Air Minum",
                type: "WATER_STATION",
                lat: centerLat - 0.0015,
                lng: centerLng - 0.0018,
                details: "Stasiun isi ulang tumbler gratis",
              },
            ];
          }

          setFacilities(list);
          setSelectedFacility(list[0] || null);
        }
      })
      .catch((err) => console.error("Error loading facilities:", err));
  };

  // Trigger GPS detection
  const requestCurrentGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Peramban Anda tidak mendukung deteksi geolokasi.");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setIsGpsActive(true);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setDetectingGps(false);

        // Update map view & radar
        if (mapRef.current) {
          mapRef.current.flyTo(coords, 16, { duration: 1.5 });

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(coords);
            userMarkerRef.current
              .bindPopup(`
                <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
                  <strong style="color: #2D6A4F;">📍 Posisi Nyata Kamu (Akurat GPS)</strong><br/>
                  <span style="color: #64748B;">Akurasi: ±${Math.round(pos.coords.accuracy)} meter</span>
                </div>
              `)
              .openPopup();
          }

          if (geofenceCircleRef.current) {
            geofenceCircleRef.current.setLatLng(coords);
          }
        }

        // Adjust facilities to be anchored nearby user's real location
        loadFacilities(coords[0], coords[1], true);
      },
      (err) => {
        console.warn("GPS error:", err.message);
        setDetectingGps(false);
        if (err.code === 1) {
          alert("Izin lokasi browser ditolak. Silakan klik ikon gembok di sebelah alamat web browser Anda dan izinkan 'Location' agar posisi Anda terdeteksi akurat.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Mount Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: defaultCampusCenter,
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    // Tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Geofence Radar Circle
    const circle = L.circle(defaultCampusCenter, {
      radius: 800,
      color: "#2D6A4F",
      weight: 2,
      dashArray: "6, 8",
      fillColor: "#52B788",
      fillOpacity: 0.12,
    }).addTo(map);
    geofenceCircleRef.current = circle;

    // User Marker
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

    const marker = L.marker(defaultCampusCenter, { icon: userIcon }).addTo(map);
    userMarkerRef.current = marker;

    marker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px;">
        <strong style="color: #2D6A4F;">📍 Posisi Kamu Sekarang</strong><br/>
        <span style="color: #64748B;">Klik 'Deteksi GPS Saya' untuk posisi GPS riil.</span>
      </div>
    `);

    // Invalidate size after render to ensure seamless tiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // Initial load
    loadFacilities(defaultCampusCenter[0], defaultCampusCenter[1], false);

    // Automatically attempt browser geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setIsGpsActive(true);
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          map.setView(coords, 16);
          marker.setLatLng(coords);
          circle.setLatLng(coords);
          loadFacilities(coords[0], coords[1], true);
        },
        () => {
          // Graceful fallback
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update facility markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
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

      const dist = getDistanceMeters(userLocation[0], userLocation[1], fac.lat, fac.lng);
      const estWalkMinutes = Math.max(1, Math.round(dist / 80));

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

      const m = L.marker([fac.lat, fac.lng], { icon: customIcon }).addTo(map);

      m.on("click", () => {
        setSelectedFacility(fac);
        map.panTo([fac.lat, fac.lng], { animate: true, duration: 0.5 });
      });

      m.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; min-width: 170px;">
          <div style="font-weight: bold; color: ${iconColor}; font-size: 13px;">${fac.name}</div>
          <div style="color: #64748B; margin-top: 3px; font-size: 11px;">${fac.details || ""}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; pt-2; border-top: 1px solid #E2E8F0;">
            <span style="font-size: 10px; font-weight: bold; color: #1E293B;">🚶 ${dist < 1000 ? `${dist}m (${estWalkMinutes} mnt)` : `${(dist/1000).toFixed(1)} km`}</span>
            <span style="background-color: ${iconBg}; color: ${iconColor}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
              ${badgeText}
            </span>
          </div>
        </div>
      `);

      markersRef.current.push(m);
    });
  }, [facilities, filterType, userLocation]);

  const filterButtons = [
    { id: "ALL", label: "Semua Fasilitas" },
    { id: "SURPLUS_MERCHANT", label: "🍽️ Kantin Surplus" },
    { id: "REUSABLE_DROP", label: "♻️ Drop Box Wadah" },
    { id: "WATER_STATION", label: "💧 Water Station" },
    { id: "BIKE_PARKING", label: "🚲 Parkir Sepeda" },
  ];

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
            {isGpsActive ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                <LocateFixed className="w-3 h-3 text-emerald-700" />
                <span>GPS Akurat Aktif (±{gpsAccuracy}m)</span>
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Lokasi Default Kampus
              </span>
            )}
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

          {/* Action GPS Button */}
          <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-2">
            <button
              onClick={requestCurrentGps}
              disabled={detectingGps}
              className="bg-brand-primary hover:bg-brand-dark text-white p-2.5 rounded-xl shadow-lg border border-white/20 transition flex items-center gap-2 text-xs font-bold"
              title="Perbarui Posisi GPS Anda"
            >
              {detectingGps ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Mendeteksi Satelit GPS...</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-4 h-4 text-emerald-300" />
                  <span>Deteksi Posisi Saya (GPS)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Canteen & Facility Drawer Sidebar */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-text-muted">
                Titik Fasilitas Terdekat
              </span>
              <span className="text-[11px] text-brand-primary font-semibold">
                Jarak GPS Nyata
              </span>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {facilities.map((fac) => {
                const isSelected = selectedFacility?.id === fac.id;
                const distanceMeters = getDistanceMeters(userLocation[0], userLocation[1], fac.lat, fac.lng);
                const walkMin = Math.max(1, Math.round(distanceMeters / 80));

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
                        {distanceMeters < 1000
                          ? `${distanceMeters} m (~${walkMin} mnt jalan kaki)`
                          : `${(distanceMeters / 1000).toFixed(1)} km`}
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
