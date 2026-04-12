"use client";

import { useEffect, useCallback, useState, memo } from "react";
import { useStore, useCredits } from "@/lib/store";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Users, Coins, Gift, Copy, Share2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Telegram icon - Paper plane logo
const TelegramIcon = memo(function TelegramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
});

// X (Twitter) icon
const XIcon = memo(function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
});

// WhatsApp icon
const WhatsAppIcon = memo(function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
});

const ShareButton = memo(function ShareButton({
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
      className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-white font-medium transition-colors ${color}`}
    >
      <Icon size={24} />
      <span className="text-xs">{label}</span>
    </button>
  );
});

const StepCard = memo(function StepCard({
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
});

const StatCard = memo(function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
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
    <div className={`p-6 rounded-2xl border ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={iconColors[color]} size={24} />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
      </div>
      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
});

export default function ReferralsPage() {
  const { apiKey } = useStore();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const { user, isLoading } = useCredits(apiKey);

  useEffect(() => {
    if (!apiKey) {
      router.push("/");
    }
  }, [apiKey, router]);

  const referralLink = user
    ? `https://t.me/AutoGithubStudentVer_bot?start=ref_${user.user_id}`
    : "";

  const referralCode = user ? `ref_${user.user_id}` : "";

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleShare = useCallback((platform: string) => {
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
  }, [referralCode, referralLink, handleCopy]);

  const stats = [
    {
      label: "Total Referrals",
      value: user?.referrals || 0,
      icon: Users,
      color: "blue" as const,
    },
    {
      label: "Credits Earned",
      value: user?.referral_credits_earned?.toFixed(2) || "0.00",
      icon: Coins,
      color: "green" as const,
    },
    {
      label: "Conversion Rate",
      value: user && user.referrals > 0 ? "100%" : "0%",
      icon: Gift,
      color: "purple" as const,
    },
  ];

  if (!apiKey) return null;

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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse">
                <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-800 mb-3" />
                <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 mb-2" />
                <div className="w-16 h-8 bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        )}

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
              icon={TelegramIcon}
              label="Telegram"
              color="bg-sky-500 hover:bg-sky-600"
              onClick={() => handleShare("telegram")}
            />
            <ShareButton
              icon={XIcon}
              label="X"
              color="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              onClick={() => handleShare("twitter")}
            />
            <ShareButton
              icon={WhatsAppIcon}
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
