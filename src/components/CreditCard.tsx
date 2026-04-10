"use client";

import { useStore } from "@/lib/store";
import { Coins, Wallet, Lock, TrendingUp, Calendar, Users } from "lucide-react";

export default function CreditCard() {
  const { user } = useStore();

  if (!user) return null;

  const stats = [
    {
      label: "API Credits",
      value: user.api_credits_available.toFixed(1),
      total: user.api_credits_total.toFixed(1),
      icon: Coins,
      color: "blue",
      locked: user.api_credits_locked,
    },
    {
      label: "Bot Credits",
      value: user.bot_credits_available.toFixed(1),
      total: null,
      icon: Wallet,
      color: "purple",
      locked: user.bot_credits_locked,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-800",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-950/30",
        text: "text-purple-700 dark:text-purple-300",
        border: "border-purple-200 dark:border-purple-800",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Credit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat) => {
          const colors = getColorClasses(stat.color);
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className={`p-6 rounded-2xl border ${colors.border} ${colors.bg}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-white dark:bg-zinc-900 ${colors.text}`}>
                  <Icon size={24} />
                </div>
                {stat.locked > 0 && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 px-2 py-1 rounded-full">
                    <Lock size={12} />
                    {stat.locked} locked
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold ${colors.text}`}>
                    {stat.value}
                  </span>
                  {stat.total && (
                    <span className="text-sm text-zinc-500 dark:text-zinc-500">
                      / {stat.total}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem
          icon={TrendingUp}
          label="Verifications"
          value={user.total_verifications.toString()}
        />
        <StatItem
          icon={Users}
          label="Referrals"
          value={user.referrals.toString()}
        />
        <StatItem
          icon={Coins}
          label="Referral Credits"
          value={user.referral_credits_earned.toFixed(2)}
        />
        <StatItem
          icon={Calendar}
          label="Joined"
          value={new Date(user.joined_at).toLocaleDateString()}
        />
      </div>
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
        <Icon size={16} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}
