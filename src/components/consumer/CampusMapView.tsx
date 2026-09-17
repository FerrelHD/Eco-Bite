"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Compass } from "lucide-react";

interface CampusMapViewProps {
  onSelectMerchant: (merchantName: string) => void;
  onNavigateToMarket: () => void;
}

// Dynamically import map core with ssr: false to guarantee clean client execution
const DynamicCampusMapCore = dynamic(() => import("./CampusMapCore"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 pb-16 animate-pulse">
      <div className="h-16 bg-surface-card rounded-2xl border border-border-subtle flex items-center px-4 gap-2">
        <Compass className="w-5 h-5 text-brand-primary animate-spin" />
        <span className="text-xs text-text-muted font-medium">Memuat radar dan peta kampus...</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-[450px] sm:h-[540px] bg-slate-200 rounded-2xl"></div>
        <div className="h-[450px] sm:h-[540px] bg-surface-card rounded-2xl border border-border-subtle p-4 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-20 bg-slate-200 rounded-xl"></div>
          <div className="h-20 bg-slate-200 rounded-xl"></div>
          <div className="h-20 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  ),
});

export const CampusMapView: React.FC<CampusMapViewProps> = (props) => {
  return <DynamicCampusMapCore {...props} />;
};
