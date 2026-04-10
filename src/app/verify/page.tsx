"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Shield, Loader2, Eye, EyeOff, GraduationCap, Briefcase } from "lucide-react";
import { toast } from "sonner";

export default function VerifyPage() {
  const { apiKey, submitVerification } = useStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student" as "student" | "faculty",
    authType: "otp" as "otp" | "totp",
    otp: "",
    totp_secret: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!apiKey) {
      router.push("/");
    }
  }, [apiKey, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
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
      toast.success(`Verification started! Job ID: ${result.job_id}`);
      router.push(`/history?job=${result.job_id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!apiKey) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            New Verification
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Submit GitHub Student Developer Pack verification
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <RoleCard
                  selected={formData.role === "student"}
                  onClick={() => setFormData({ ...formData, role: "student" })}
                  icon={GraduationCap}
                  title="Student"
                  description="For students"
                />
                <RoleCard
                  selected={formData.role === "faculty"}
                  onClick={() => setFormData({ ...formData, role: "faculty" })}
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
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
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="GitHub password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
                    onChange={() => setFormData({ ...formData, authType: "otp" })}
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
                    onChange={() => setFormData({ ...formData, authType: "totp" })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    TOTP Secret
                  </span>
                </label>
              </div>

              {formData.authType === "otp" ? (
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              ) : (
                <input
                  type="text"
                  value={formData.totp_secret}
                  onChange={(e) =>
                    setFormData({ ...formData, totp_secret: e.target.value })
                  }
                  placeholder="TOTP secret (e.g., JBSWY3DPEHPK3PXP)"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Starting Verification...
                </>
              ) : (
                "Start Verification"
              )}
            </button>

            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
              1 API credit will be locked during verification. Credits are only charged on approval.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

function RoleCard({
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
}
