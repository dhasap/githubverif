"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Users, Coins, Gift, Copy, Share2, MessageCircle, CheckCircle } from "lucide-react";

// Twitter icon component (not available in older lucide-react)
function Twitter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}
import { toast } from "sonner";
import { useState } from "react";

export default function ReferralsPage() {
  const { apiKey, user, fetchUser } = useStore();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!apiKey) {
      router.push("/");
      return;
    }
    fetchUser();
  }, [apiKey, router, fetchUser]);

  if (!apiKey) return null;

  const referralLink = user
    ? `https://t.me/AutoGithubStudentVer_bot?start=ref_${user.user_id}`
    : "";

  const referralCode = user ? `ref_${user.user_id}` : "";

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async (platform: string) => {
    const text = `Get your GitHub Student Developer Pack verified automatically! Use my referral code: ${referralCode}\n\n${referralLink}`;

    switch (platform) {
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
            "Get your GitHub Student Developer Pack verified automatically!"
          )}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text)}`,
          "_blank"
        );
        break;
      default:
        handleCopy(text);
    }
  };

  const stats = [
    {
      label: "Total Referrals",
      value: user?.referrals || 0,
      icon: Users,
      color: "blue",
    },
    {
      label: "Credits Earned",
      value: user?.referral_credits_earned?.toFixed(2) || "0.00",
      icon: Coins,
      color: "green",
    },
    {
      label: "Conversion Rate",
      value: user && user.referrals > 0 ? "100%" : "0%",
      icon: Gift,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Referrals
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Invite friends and earn credits
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => {
            const colors: Record<string, string> = {
              blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
              green: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
              purple: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
            };

            const iconColors: Record<string, string> = {
              blue: "text-blue-600 dark:text-blue-400",
              green: "text-green-600 dark:text-green-400",
              purple: "text-purple-600 dark:text-purple-400",
            };

            return (
              <div
                key={stat.label}
                className={`p-6 rounded-2xl border ${colors[stat.color]}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <stat.icon className={iconColors[stat.color]} size={24} />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {stat.label}
                  </span>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Referral Link Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
              <Share2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Your Referral Link
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Share this link with friends to earn credits
              </p>
            </div>
          </div>

          {/* Link Display */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 text-sm font-mono"
            />
            <button
              onClick={() => handleCopy(referralLink)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          {/* Referral Code */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Referral Code:
            </span>
            <code className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-sm">
              {referralCode}
            </code>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Share via
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ShareButton
              icon={MessageCircle}
              label="Telegram"
              color="bg-sky-500 hover:bg-sky-600"
              onClick={() => handleShare("telegram")}
            />
            <ShareButton
              icon={Twitter}
              label="Twitter"
              color="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              onClick={() => handleShare("twitter")}
            />
            <ShareButton
              icon={MessageCircle}
              label="WhatsApp"
              color="bg-green-500 hover:bg-green-600"
              onClick={() => handleShare("whatsapp")}
            />
            <ShareButton
              icon={Copy}
              label="Copy Text"
              color="bg-zinc-600 hover:bg-zinc-700"
              onClick={() => handleShare("copy")}
            />
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StepCard
              number={1}
              title="Share your link"
              description="Send your referral link to friends who need GitHub Student verification"
            />
            <StepCard
              number={2}
              title="They sign up"
              description="Friends join using your link and complete their first verification"
            />
            <StepCard
              number={3}
              title="You earn credits"
              description="Get bonus credits for each successful referral automatically"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function ShareButton({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium transition-colors ${color}`}
    >
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mx-auto mb-3">
        {number}
      </div>
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
