"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useStore, Job } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import JobStatusBadge from "@/components/JobStatusBadge";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

function HistoryContent() {
  const { apiKey, fetchJobs, fetchJob } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightJobId = searchParams.get("job");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);

  const limit = 10;

  const loadJobs = useCallback(async () => {
    try {
      const data = await fetchJobs(limit, offset);
      setJobs(data.jobs);
      setCount(data.count);
    } catch (err) {
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, [fetchJobs, offset]);

  useEffect(() => {
    if (!apiKey) {
      router.push("/");
      return;
    }
    loadJobs();
  }, [apiKey, router, loadJobs]);

  // Poll for job status if highlightJobId exists and job is not finalized
  useEffect(() => {
    if (!highlightJobId || !apiKey) return;

    const finalizedStatuses = ["approved", "rejected", "failed", "timeout"];
    let interval: NodeJS.Timeout;

    const pollJob = async () => {
      try {
        setPollingJobId(highlightJobId);
        const job = await fetchJob(highlightJobId);

        // Update jobs list
        setJobs((prev) =>
          prev.map((j) => (j.job_id === job.job_id ? job : j))
        );

        if (finalizedStatuses.includes(job.status)) {
          clearInterval(interval);
          setPollingJobId(null);
          if (job.status === "approved") {
            toast.success("Verification approved!");
          } else if (job.status === "rejected") {
            toast.error("Verification rejected");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollJob();
    interval = setInterval(pollJob, 3000);

    return () => clearInterval(interval);
  }, [highlightJobId, apiKey, fetchJob]);

  if (!apiKey) return null;

  const totalPages = Math.ceil(count / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Job History
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              View your verification history
            </p>
          </div>
          <button
            onClick={loadJobs}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Jobs Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    App ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin mx-auto text-zinc-400" />
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400"
                    >
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.job_id}
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                        highlightJobId === job.job_id
                          ? "bg-blue-50 dark:bg-blue-950/30"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
                            {job.job_id.slice(0, 12)}...
                          </code>
                          {pollingJobId === job.job_id && (
                            <Loader2 size={14} className="animate-spin text-blue-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <JobStatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 capitalize">
                        {job.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                        {job.credits_charged !== undefined
                          ? job.credits_charged
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        {job.elapsed_seconds !== undefined ? (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {job.elapsed_seconds}s
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {job.app_id ? (
                          <a
                            href={`https://education.github.com/students`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {job.app_id}
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing {offset + 1}-{Math.min(offset + limit, count)} of {count}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setOffset(Math.min((totalPages - 1) * limit, offset + limit))
                  }
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-zinc-400" size={32} />
        </div>
      </main>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <HistoryContent />
    </Suspense>
  );
}
