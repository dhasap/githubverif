"use client";

import { useEffect, useState, memo } from "react";
import { X, Shield, AlertCircle, Lock, Zap, Clock } from "lucide-react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    email: string;
    role: string;
    authType: "otp" | "totp";
  };
  credits: {
    available: number;
    locked: number;
  };
}

const VerificationModal = memo(function VerificationModal({
  isOpen,
  onClose,
  onConfirm,
  data,
  credits,
}: VerificationModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate credit cost based on role (faculty/teacher = 3, student = 1)
  const creditCost = data.role === "student" ? 1 : 3;

  useEffect(() => {
    if (!isOpen) return;

    // Store original overflow and disable scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setIsAnimating(true);

    // Restore scrolling when modal closes or unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Confirm Verification
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Cards */}
          <div className="space-y-3">
            <InfoRow label="Email" value={data.email} />
            <InfoRow
              label="Account Type"
              value={data.role === "student" ? "🎓 Student" : "👨‍🏫 Faculty"}
            />
            <InfoRow
              label="2FA Method"
              value={data.authType === "otp" ? "📱 One-time Code" : "🔐 TOTP Secret"}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700 to-transparent" />

          {/* Credit Info */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Credit Lock
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                  {creditCost} {creditCost === 1 ? "credit" : "credits"} will be locked during verification. Refunded if rejected/failed.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Available: <strong>{credits.available.toFixed(1)}</strong>
                  </span>
                  <span className="text-zinc-400">→</span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    After: <strong>{(credits.available - creditCost).toFixed(1)}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Estimated time: <strong>3-5 minutes</strong>
            </span>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-zinc-500 dark:text-zinc-400">
              Make sure your GitHub credentials are correct. Wrong credentials may result in temporary account lock.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Start Verification
          </button>
        </div>
      </div>
    </div>
  );
});

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  );
}

export default VerificationModal;
