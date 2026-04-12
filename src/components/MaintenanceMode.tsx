"use client";

import { useState } from "react";
import { AlertTriangle, Clock, Wrench, Power, RefreshCw } from "lucide-react";
import { useMaintenanceMode, MaintenanceConfig } from "@/lib/maintenance";

interface MaintenanceToggleProps {
  onClose?: () => void;
}

export function MaintenanceToggle({ onClose }: MaintenanceToggleProps) {
  const { config, isMaintenanceMode, setMaintenanceMode, toggleMaintenance, resetMaintenance } =
    useMaintenanceMode();
  const [message, setMessage] = useState(config.message);
  const [estimatedDuration, setEstimatedDuration] = useState(config.estimatedDuration || "");

  const handleSave = () => {
    setMaintenanceMode({
      message,
      estimatedDuration: estimatedDuration || undefined,
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
            <Wrench size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Maintenance Mode
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage maintenance mode settings
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            ×
          </button>
        )}
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 mb-6">
        <div className="flex items-center gap-3">
          <Power
            size={20}
            className={
              isMaintenanceMode
                ? "text-amber-600"
                : "text-zinc-400"
            }
          />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {isMaintenanceMode ? "Maintenance Mode ON" : "Maintenance Mode OFF"}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {isMaintenanceMode
                ? "Users will see maintenance screen"
                : "Application running normally"}
            </p>
          </div>
        </div>
        <button
          onClick={toggleMaintenance}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isMaintenanceMode ? "bg-amber-500" : "bg-zinc-200 dark:bg-zinc-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isMaintenanceMode ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Maintenance Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter maintenance message..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Estimated Duration (optional)
          </label>
          <input
            type="text"
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
            placeholder="e.g., 1-2 hours"
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
          <button
            onClick={resetMaintenance}
            className="py-2 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Preview */}
      {isMaintenanceMode && (
        <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Preview
          </p>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                  Maintenance Mode
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  {config.message}
                </p>
                {config.estimatedDuration && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-amber-700 dark:text-amber-300">
                    <Clock size={14} />
                    <span>Estimated: {config.estimatedDuration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Full screen maintenance page component
interface MaintenancePageProps {
  config?: MaintenanceConfig;
}

export function MaintenancePage({ config }: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 mb-4">
            <Wrench size={40} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Under Maintenance
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {config?.message || DEFAULT_CONFIG.message}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20">
            <Clock className="text-amber-600 dark:text-amber-400" size={20} />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Estimated Time
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {config?.estimatedDuration || "1-2 hours"}
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_CONFIG: MaintenanceConfig = {
  enabled: false,
  message: "Server sedang maintenance. Silakan coba lagi dalam 1-2 jam.",
  estimatedDuration: "1-2 hours",
  allowBypass: false,
};
