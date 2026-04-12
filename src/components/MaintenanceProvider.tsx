"use client";

import { useEffect, useState } from "react";
import { useMaintenanceMode } from "@/lib/maintenance";
import { MaintenancePage } from "./MaintenanceMode";

interface MaintenanceProviderProps {
  children: React.ReactNode;
}

export function MaintenanceProvider({ children }: MaintenanceProviderProps) {
  const { config, isLoaded, isMaintenanceMode } = useMaintenanceMode();
  const [showMaintenance, setShowMaintenance] = useState(false);

  useEffect(() => {
    // Only show maintenance page after loading to prevent flash
    if (isLoaded) {
      setShowMaintenance(isMaintenanceMode);
    }
  }, [isLoaded, isMaintenanceMode]);

  if (!isLoaded) {
    // Show nothing while loading to prevent flash
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (showMaintenance) {
    return <MaintenancePage config={config} />;
  }

  return <>{children}</>;
}
