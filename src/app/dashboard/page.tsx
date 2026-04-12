"use client";

import { useEffect } from "react";
import { useStore, useCredits } from "@/lib/store";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CreditCard from "@/components/CreditCard";
import { BroadcastContainer } from "@/components/BroadcastNotification";
import { CheckCircle, Clock, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { apiKey } = useStore();
  const router = useRouter();
  const { user, isLoading, error } = useCredits(apiKey);

  useEffect(() => {
    if (!apiKey) {
      router.push("/");
    }
  }, [apiKey, router]);

  if (!apiKey) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Overview of your account and credits
          </p>
        </div>

        {/* Broadcast Notifications */}
        <BroadcastContainer className="mb-6" />

        {/* Credit Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CreditCardSkeleton />
            <CreditCardSkeleton />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error.message}</p>
          </div>
        ) : (
          <CreditCard user={user} />
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              icon={CheckCircle}
              title="New Verification"
              description="Start a new GitHub verification"
              href="/verify"
              color="blue"
            />
            <ActionCard
              icon={Clock}
              title="View History"
              description="Check your verification history"
              href="/history"
              color="purple"
            />
            <ActionCard
              icon={AlertCircle}
              title="Settings"
              description="Manage your API key"
              href="/settings"
              color="gray"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function CreditCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="w-16 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="space-y-2">
        <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="w-16 h-8 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: {
      bg: "hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-800 dark:hover:bg-blue-950/30",
      icon: "text-blue-600 dark:text-blue-400",
    },
    purple: {
      bg: "hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-800 dark:hover:bg-purple-950/30",
      icon: "text-purple-600 dark:text-purple-400",
    },
    gray: {
      bg: "hover:border-zinc-300 hover:bg-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-800",
      icon: "text-zinc-600 dark:text-zinc-400",
    },
  };

  const colors = colorClasses[color] || colorClasses.gray;

  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 p-4 rounded-xl border border-zinc-200 bg-white transition-all dark:border-zinc-800 dark:bg-zinc-900 ${colors.bg}`}
    >
      <div className={`p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${colors.icon}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
      <ArrowRight
        size={20}
        className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
      />
    </Link>
  );
}
