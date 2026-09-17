"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MarketplaceView } from "@/components/consumer/MarketplaceView";
import { CampusMapView } from "@/components/consumer/CampusMapView";
import { ActiveRescuePassView } from "@/components/consumer/ActiveRescuePassView";
import { ProfileImpactView } from "@/components/consumer/ProfileImpactView";

export default function Home() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [userRole, setUserRole] = useState<string>("STUDENT");
  const [userName, setUserName] = useState<string>("Rian Pratama");
  const [ecoPoints, setEcoPoints] = useState(1250);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Fetch initial session
  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data.user) {
        setUserRole(data.user.role);
        setUserName(data.user.name);
        setEcoPoints(data.user.ecoPoints || 1250);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Session load error:", err);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleOrderSuccess = (orderId: string) => {
    fetchSession();
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-text-primary">
      {/* Student Dedicated Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        userName={userName}
        ecoPoints={ecoPoints}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoggedIn={isLoggedIn}
      />

      {/* Main Student Portal Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === "marketplace" && (
          <MarketplaceView
            searchQuery={searchQuery}
            onOrderSuccess={handleOrderSuccess}
            onNavigateToPass={() => setActiveTab("ticket")}
            onNavigateToMap={() => setActiveTab("map")}
          />
        )}

        {activeTab === "map" && (
          <CampusMapView
            onSelectMerchant={(merchantName) => {
              setSearchQuery(merchantName);
              setActiveTab("marketplace");
            }}
            onNavigateToMarket={() => setActiveTab("marketplace")}
          />
        )}

        {activeTab === "ticket" && (
          <ActiveRescuePassView
            onNavigateToMap={() => setActiveTab("map")}
            onNavigateToMarket={() => setActiveTab("marketplace")}
          />
        )}

        {activeTab === "profile" && <ProfileImpactView />}
      </main>

      {/* Mobile Floating Bottom Bar for Students */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-border-subtle py-2 px-4 z-40 flex justify-around text-[10px] font-semibold text-text-muted">
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "marketplace" ? "text-brand-primary font-bold" : ""
          }`}
        >
          <span>🛍️</span>
          <span>Beranda</span>
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "map" ? "text-brand-primary font-bold" : ""
          }`}
        >
          <span>🗺️</span>
          <span>Radar</span>
        </button>
        <button
          onClick={() => setActiveTab("ticket")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "ticket" ? "text-brand-primary font-bold" : ""
          }`}
        >
          <span>🎫</span>
          <span>Tiket</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "profile" ? "text-brand-primary font-bold" : ""
          }`}
        >
          <span>🌿</span>
          <span>Dampak</span>
        </button>
      </div>
    </div>
  );
}
