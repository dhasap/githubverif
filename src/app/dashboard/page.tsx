"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CreditCard from "@/components/CreditCard";
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { apiKey, user, fetchUser } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!apiKey) {
      router.push("/");
      return;
    }
    fetchUser();
  }, [apiKey, router, fetchUser]);

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

        {/* Credit Stats */}
        <CreditCard />

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
