"use client";

import { useEffect, useState, useCallback, useRef, memo } from "react";
import { useStore, useCredits } from "@/lib/store";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Shield, Eye, EyeOff, GraduationCap, Briefcase, AlertCircle, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { verificationFormSchema } from "@/lib/validation";
import VerificationModal from "@/components/VerificationModal";
import ProgressSteps from "@/components/ProgressSteps";
import Confetti from "@/components/Confetti";

type FormErrors = {
  [key: string]: string;
};

export default function VerifyPage() {
  const { apiKey, submitVerification } = useStore();
  const { user } = useCredits(apiKey);
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student" as "student" | "faculty",
    authType: "otp" as "otp" | "totp",
    otp: "",
    totp_secret: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // New states for enhanced UX
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressStatus, setProgressStatus] = useState<"loading" | "success" | "error">("loading");
  const [showConfetti, setShowConfetti] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!apiKey) {
      router.push("/");
    }
  }, [apiKey, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Progress animation
  useEffect(() => {
    if (isSubmitting && progress < 90) {
      const timer = setTimeout(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSubmitting, progress]);

  // Validate single field
  const validateField = useCallback((name: string, value: unknown) => {
    try {
      const fieldSchema = name === "otp"
        ? z.string().regex(/^\d{6}$/, "Must be 6 digits")
        : name === "email"
        ? z.string().email("Invalid email")
        : z.string().min(1, "Required");

      fieldSchema.parse(value);
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [name]: err.issues[0]?.message || "Invalid",
        }));
      }
    }
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    try {
      verificationFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        err.issues.forEach((error) => {
          const path = error.path[0] as string;
          if (!newErrors[path]) {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  const handleChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched.has(name)) {
      validateField(name, value);
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name: string) => {
    setTouched((prev) => new Set(prev).add(name));
    validateField(name, formData[name as keyof typeof formData]);
  }, [formData, validateField]);

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched(new Set(Object.keys(formData)));

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Show confirmation modal
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    setIsSubmitting(true);
    setProgressStatus("loading");
    setCurrentStep(1);
    setProgress(10);

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Simulate progress steps
    const stepTimers: NodeJS.Timeout[] = [];

    stepTimers.push(setTimeout(() => setCurrentStep(2), 800));
    stepTimers.push(setTimeout(() => setCurrentStep(3), 1500));

    // Cleanup function for timers
    const cleanupTimers = () => {
      stepTimers.forEach(clearTimeout);
      stepTimers.length = 0;
    };

    try {
      const payload: {
        email: string;
        password: string;
        role: string;
        otp?: string;
        totp_secret?: string;
      } = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.authType === "otp" && formData.otp) {
        payload.otp = formData.otp;
      } else if (formData.authType === "totp" && formData.totp_secret) {
        payload.totp_secret = formData.totp_secret;
      }

      const result = await submitVerification(payload);

      // Cleanup timers on success
      cleanupTimers();

      setProgress(100);
      setCurrentStep(4);
      setProgressStatus("success");
      setShowConfetti(true);

      // Custom toast with action
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">🎉 Verification Started!</span>
          <span className="text-sm opacity-90">Job ID: {result.job_id.slice(0, 12)}...</span>
        </div>,
        {
          duration: 5000,
          action: {
            label: "View Status →",
            onClick: () => router.push(`/history?job=${result.job_id}`),
          },
        }
      );

      // Navigate after delay
      setTimeout(() => {
        router.push(`/history?job=${result.job_id}`);
      }, 2500);

    } catch (err) {
      setProgressStatus("error");
      cleanupTimers();

      if (err instanceof Error && err.name === "AbortError") {
        toast.info("Verification cancelled");
        return;
      }

      toast.error(err instanceof Error ? err.message : "Verification failed", {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
      // Reset abort controller
      abortControllerRef.current = null;
    }
  };

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsSubmitting(false);
      setShowModal(false);
      setCurrentStep(0);
      setProgress(0);
      toast.info("Verification cancelled");
    }
  }, []);

  if (!apiKey) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      <VerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        data={{
          email: formData.email,
          role: formData.role,
          authType: formData.authType,
        }}
        credits={{
          available: user?.api_credits_available || 0,
          locked: user?.api_credits_locked || 0,
        }}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            New Verification
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Submit GitHub Student Developer Pack verification
          </p>
        </div>

        {isSubmitting ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
            <ProgressSteps
              currentStep={currentStep}
              status={progressStatus}
            />
            <div className="mt-6 text-center">
              <button
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
            <form onSubmit={handleSubmitClick} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <RoleCard
                    selected={formData.role === "student"}
                    onClick={() => setFormData((prev) => ({ ...prev, role: "student" }))}
                    icon={GraduationCap}
                    title="Student"
                    description="For students"
                  />
                  <RoleCard
                    selected={formData.role === "faculty"}
                    onClick={() => setFormData((prev) => ({ ...prev, role: "faculty" }))}
                    icon={Briefcase}
                    title="Faculty"
                    description="For teachers"
                  />
                </div>
              </div>

              {/* GitHub Credentials */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Shield size={16} className="text-blue-600" />
                  GitHub Credentials
                </h3>

                <div>
                  <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:bg-zinc-800 dark:text-zinc-100 ${
                      errors.email && touched.has("email")
                        ? "border-red-300 focus:border-red-500 dark:border-red-800"
                        : "border-zinc-200 focus:border-blue-500 dark:border-zinc-700"
                    }`}
                  />
                  {errors.email && touched.has("email") && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      placeholder="GitHub password"
                      className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:bg-zinc-800 dark:text-zinc-100 ${
                        errors.password && touched.has("password")
                          ? "border-red-300 focus:border-red-500 dark:border-red-800"
                          : "border-zinc-200 focus:border-blue-500 dark:border-zinc-700"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && touched.has("password") && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* 2FA Method */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  2FA Method
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="otp"
                      checked={formData.authType === "otp"}
                      onChange={() => setFormData((prev) => ({ ...prev, authType: "otp" }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      One-time Code
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="totp"
                      checked={formData.authType === "totp"}
                      onChange={() => setFormData((prev) => ({ ...prev, authType: "totp" }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      TOTP Secret
                    </span>
                  </label>
                </div>

                {formData.authType === "otp" ? (
                  <div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.otp}
                      onChange={(e) => handleChange("otp", e.target.value.replace(/\D/g, ""))}
                      onBlur={() => handleBlur("otp")}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:bg-zinc-800 dark:text-zinc-100 ${
                        errors.otp && touched.has("otp")
                          ? "border-red-300 focus:border-red-500 dark:border-red-800"
                          : "border-zinc-200 focus:border-blue-500 dark:border-zinc-700"
                      }`}
                    />
                    {errors.otp && touched.has("otp") && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.otp}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formData.totp_secret}
                      onChange={(e) => handleChange("totp_secret", e.target.value)}
                      onBlur={() => handleBlur("totp_secret")}
                      placeholder="TOTP secret (e.g., JBSWY3DPEHPK3PXP)"
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:bg-zinc-800 dark:text-zinc-100 ${
                        errors.totp_secret && touched.has("totp_secret")
                          ? "border-red-300 focus:border-red-500 dark:border-red-800"
                          : "border-zinc-200 focus:border-blue-500 dark:border-zinc-700"
                      }`}
                    />
                    {errors.totp_secret && touched.has("totp_secret") && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.totp_secret}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button with Progress */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden"
                >
                  {/* Progress bar background */}
                  {isSubmitting && (
                    <div
                      className="absolute left-0 top-0 h-full bg-white/20 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  )}

                  <span className="relative flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Start Verification
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                  {formData.role === "student" ? "1 API credit" : "3 API credits"} will be locked during verification. Credits are only charged on approval.
                </p>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

const RoleCard = memo(function RoleCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
        selected
          ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30"
          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
      }`}
    >
      <div
        className={`p-2 rounded-lg ${
          selected
            ? "bg-blue-600 text-white"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
        }`}
      >
        <Icon size={20} />
      </div>
      <div className="text-left">
        <p
          className={`font-medium ${
            selected
              ? "text-blue-900 dark:text-blue-100"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
    </button>
  );
});
