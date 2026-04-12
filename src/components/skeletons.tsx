/**
 * Skeleton loading components for better UX
 */

import { memo } from "react";

// Base shimmer effect
const Shimmer = memo(function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-zinc-200/20 dark:via-zinc-700/20 to-transparent" />
  );
});

// Card skeleton
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${className}`}
    >
      <Shimmer />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-16 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-16 h-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Stats grid skeleton
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
        >
          <Shimmer />
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
            <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="w-12 h-6 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// Full credit card section skeleton
export function CreditCardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <StatsGridSkeleton />
    </div>
  );
}

// Table row skeleton
function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="w-20 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="w-8 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="w-12 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </td>
    </tr>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            {[...Array(6)].map((_, i) => (
              <th key={i} className="px-6 py-4">
                <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {[...Array(rows)].map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-full h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      ))}
      <div className="w-full h-14 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    </div>
  );
}

// Action card skeleton
export function ActionCardSkeleton() {
  return (
    <div className="relative overflow-hidden flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <Shimmer />
      <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      <div className="flex-1 space-y-1">
        <div className="w-24 h-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="w-32 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
      <div className="w-5 h-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    </div>
  );
}

// Page header skeleton
export function PageHeaderSkeleton() {
  return (
    <div className="mb-8 space-y-2">
      <div className="w-48 h-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      <div className="w-64 h-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    </div>
  );
}

// Stats card skeleton for individual use
export function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <Shimmer />
      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
        <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
      <div className="w-12 h-6 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    </div>
  );
}
