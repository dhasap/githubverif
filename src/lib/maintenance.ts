"use client";

import { useState, useEffect, useCallback } from "react";

const MAINTENANCE_KEY = "devpack-maintenance-mode";

export interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  estimatedDuration?: string;
  allowBypass?: boolean;
}

const DEFAULT_CONFIG: MaintenanceConfig = {
  enabled: false,
  message: "Server sedang maintenance. Silakan coba lagi dalam 1-2 jam.",
  estimatedDuration: "1-2 hours",
  allowBypass: false,
};

export function useMaintenanceMode() {
  const [config, setConfig] = useState<MaintenanceConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(MAINTENANCE_KEY);
      if (saved) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      }
    } catch {
      // Use default
    }
    setIsLoaded(true);
  }, []);

  const setMaintenanceMode = useCallback((newConfig: Partial<MaintenanceConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      if (typeof window !== "undefined") {
        localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const toggleMaintenance = useCallback(() => {
    setConfig((prev) => {
      const updated = { ...prev, enabled: !prev.enabled };
      if (typeof window !== "undefined") {
        localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const resetMaintenance = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(MAINTENANCE_KEY);
    }
    setConfig(DEFAULT_CONFIG);
  }, []);

  return {
    config,
    isLoaded,
    isMaintenanceMode: config.enabled,
    setMaintenanceMode,
    toggleMaintenance,
    resetMaintenance,
  };
}

// Check if maintenance mode is active (for use in components)
export function checkMaintenanceMode(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const saved = localStorage.getItem(MAINTENANCE_KEY);
    if (saved) {
      const config: MaintenanceConfig = JSON.parse(saved);
      return config.enabled;
    }
  } catch {
    // Ignore
  }
  return false;
}
