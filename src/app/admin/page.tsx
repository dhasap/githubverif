"use client";

import { useEffect, useState, useMemo } from "react";
import { useStore, useJobs, useCredits, Job } from "@/lib/store";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import Header from "@/components/Header";
import { BroadcastManager } from "@/components/BroadcastNotification";
import { MaintenanceToggle } from "@/components/MaintenanceMode";
import { AdminManager } from "@/components/AdminManager";
import {
  Loader2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  CreditCard,
  Calendar,
  BarChart3,
  Shield,
} from "lucide-react";

interface Stats {
  totalJobs: number;
  approvedJobs: number;
  rejectedJobs: number;
  pendingJobs: number;
  failedJobs: number;
  totalCreditsUsed: number;
  averageDuration: number;
  successRate: number;
  jobsByRole: Record<string, number>;
  jobsByDay: Record<string, number>;
}

function calculateStats(jobs: Job[]): Stats {
  const totalJobs = jobs.length;
  const approvedJobs = jobs.filter((j) => j.status === "approved").length;
  const rejectedJobs = jobs.filter((j) => j.status === "rejected").length;
  const pendingJobs = jobs.filter(
    (j) => j.status === "pending" || j.status === "queued"
  ).length;
  const failedJobs = jobs.filter(
    (j) => j.status === "failed" || j.status === "timeout"
  ).length;

  const totalCreditsUsed = jobs.reduce(
    (sum, j) => sum + (j.credits_charged || 0),
    0
  );

  const completedJobs = jobs.filter((j) => j.elapsed_seconds !== undefined);
  const averageDuration =
    completedJobs.length > 0
      ? completedJobs.reduce((sum, j) => sum + (j.elapsed_seconds || 0), 0) /
        completedJobs.length
      : 0;

  const successRate = totalJobs > 0 ? (approvedJobs / totalJobs) * 100 : 0;

  const jobsByRole = jobs.reduce((acc, j) => {
    acc[j.role] = (acc[j.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobsByDay = jobs.reduce((acc, j) => {
    const date = new Date(j.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalJobs,
    approvedJobs,
    rejectedJobs,
    pendingJobs,
    failedJobs,
    totalCreditsUsed,
    averageDuration,
    successRate,
    jobsByRole,
    jobsByDay,
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    green:
      "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400",
    red: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
    zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    purple: "bg-purple-500",
    zinc: "bg-zinc-500",
  };

  return (
    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color]}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export default function AdminPage() {
  const { apiKey } = useStore();
  const router = useRouter();
  const { jobs, isLoading: jobsLoading, error: jobsError } = useJobs(apiKey, 100, 0);
  const { user, isLoading: userLoading } = useCredits(apiKey);

  // Check admin access
  useEffect(() => {
    if (!apiKey) {
      router.push("/");
      return;
    }

    // Wait for user data to load
    if (userLoading) return;

    // If no user data, redirect to login
    if (!user) {
      router.push("/");
      return;
    }

    // Redirect non-admin users to dashboard
    if (!isAdmin(user)) {
      router.push("/dashboard");
    }
  }, [apiKey, router, user, userLoading]);

  const isLoading = jobsLoading || userLoading;

  const stats = useMemo(() => calculateStats(jobs), [jobs]);

  // Show loading while checking auth or admin status
  if (!apiKey || userLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="animate-spin text-zinc-400" size={32} />
        </div>
      </div>
    );
  }

  // If not admin, show access denied (will redirect via useEffect)
  if (!user || !isAdmin(user)) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto text-zinc-400 mb-4" size={32} />
            <p className="text-zinc-500 dark:text-zinc-400">Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Admin Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
              <Shield size={14} />
              Admin
            </span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Overview and statistics of your verification activity
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-zinc-400" size={32} />
          </div>
        ) : jobsError ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">Error loading jobs: {jobsError.message}</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Jobs"
                value={stats.totalJobs}
                icon={BarChart3}
                color="blue"
                subtitle="All time verifications"
              />
              <StatCard
                title="Success Rate"
                value={`${stats.successRate.toFixed(1)}%`}
                icon={TrendingUp}
                color="green"
                subtitle={`${stats.approvedJobs} approved`}
              />
              <StatCard
                title="Credits Used"
                value={stats.totalCreditsUsed.toFixed(1)}
                icon={CreditCard}
                color="purple"
                subtitle="Total consumed"
              />
              <StatCard
                title="Avg Duration"
                value={`${stats.averageDuration.toFixed(1)}s`}
                icon={Clock}
                color="amber"
                subtitle="Per verification"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
                  Status Distribution
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Approved
                      </span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                        {stats.approvedJobs} ({stats.totalJobs > 0 ? ((stats.approvedJobs / stats.totalJobs) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={
                        stats.totalJobs > 0
                          ? (stats.approvedJobs / stats.totalJobs) * 100
                          : 0
                      }
                      color="green"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Rejected
                      </span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                        {stats.rejectedJobs} ({stats.totalJobs > 0 ? ((stats.rejectedJobs / stats.totalJobs) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={
                        stats.totalJobs > 0
                          ? (stats.rejectedJobs / stats.totalJobs) * 100
                          : 0
                      }
                      color="red"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Pending/Queued
                      </span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                        {stats.pendingJobs} ({stats.totalJobs > 0 ? ((stats.pendingJobs / stats.totalJobs) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={
                        stats.totalJobs > 0
                          ? (stats.pendingJobs / stats.totalJobs) * 100
                          : 0
                      }
                      color="amber"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Failed/Timeout
                      </span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                        {stats.failedJobs} ({stats.totalJobs > 0 ? ((stats.failedJobs / stats.totalJobs) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={
                        stats.totalJobs > 0
                          ? (stats.failedJobs / stats.totalJobs) * 100
                          : 0
                      }
                      color="zinc"
                    />
                  </div>
                </div>
              </div>

              {/* Role Distribution */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
                  Verifications by Role
                </h2>
                <div className="space-y-4">
                  {Object.entries(stats.jobsByRole).map(([role, count]) => {
                    const roleLower = role.toLowerCase();
                    const isStudent = roleLower === "student" || roleLower === "students";
                    const isFaculty = roleLower === "faculty";
                    const roleIcon = isStudent ? "🎓" : isFaculty ? "👨‍🏫" : "";
                    const roleColor = isStudent ? "blue" : isFaculty ? "purple" : "zinc";
                    const displayRole = role.trim() || "Student";
                    return (
                      <div key={role}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-600 dark:text-zinc-400 capitalize">
                            {roleIcon} {displayRole}
                          </span>
                          <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                            {count} ({((count / stats.totalJobs) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <ProgressBar
                          value={(count / stats.totalJobs) * 100}
                          color={roleColor}
                        />
                      </div>
                    );
                  })}
                  {Object.keys(stats.jobsByRole).length === 0 && (
                    <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">
                      No data available
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
                  Activity Timeline
                </h2>
                <div className="space-y-3">
                  {Object.entries(stats.jobsByDay)
                    .sort(
                      (a, b) =>
                        new Date(b[0]).getTime() - new Date(a[0]).getTime()
                    )
                    .slice(0, 7)
                    .map(([date, count]) => (
                      <div
                        key={date}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                            <Calendar size={16} />
                          </div>
                          <span className="text-sm text-zinc-900 dark:text-zinc-100">
                            {date}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                          {count} job{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  {Object.keys(stats.jobsByDay).length === 0 && (
                    <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">
                      No activity yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Management */}
            <div className="mt-6">
              <AdminManager currentUserId={user?.user_id} />
            </div>

            {/* Broadcast Manager */}
            <div className="mt-6">
              <BroadcastManager />
            </div>

            {/* Maintenance Mode */}
            <div className="mt-6">
              <MaintenanceToggle />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
