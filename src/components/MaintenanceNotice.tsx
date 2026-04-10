"use client";

import { AlertTriangle, Clock, RefreshCw } from "lucide-react";

export default function MaintenanceNotice() {
  return (
    <div className="w-full max-w-lg mx-auto p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Maintenance Mode
          </h3>
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            GitHub Verification Server sedang mengalami high traffic.
            Tim sedang bekerja untuk meningkatkan accuracy dan memperbaiki bugs.
          </p>
          <div className="mt-4 space-y-2 text-sm text-amber-600 dark:text-amber-400">
            <p className="flex items-center gap-2">
              <Clock size={16} />
              Estimasi: 1-2 jam
            </p>
            <p className="flex items-center gap-2">
              <RefreshCw size={16} />
              Jika reject, bisa retry 2-3x (tidak charge credit)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
