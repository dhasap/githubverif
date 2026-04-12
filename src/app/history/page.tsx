"use client";

import { useEffect, useState, useCallback, useMemo, Suspense, memo, useRef } from "react";
import { useStore, useJobs, useJob, Job } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import JobStatusBadge from "@/components/JobStatusBadge";
import JobDetailModal from "@/components/JobDetailModal";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useSoundSettings } from "@/lib/sound";

const HISTORY_LIMIT = 10;

// Memoized table row component
const JobRow = memo(function JobRow({
  job,
  isHighlighted,
  isPolling,
  onViewDetail,
}: {
  job: Job;
  isHighlighted: boolean;
  isPolling: boolean;
  onViewDetail: (job: Job) => void;
}) {
  return (
    <tr
      className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
        isHighlighted
          ? "bg-blue-50 dark:bg-blue-950/30"
          : ""
      }`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetail(job)}
            className="text-sm font-mono text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            {job.job_id.slice(0, 12)}...
          </button>
          {isPolling && (
            <Loader2 size={14} className="animate-spin text-blue-600" />
          )}
          <button
            onClick={() => onViewDetail(job)}
            className="p-1 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            title="View details"
          >
            <Eye size={14} />
          </button>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <JobStatusBadge status={job.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 capitalize">
        {job.role?.trim() || "Student/Faculty"}
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
  );
});

// Memoized table component
const JobsTable = memo(function JobsTable({
  jobs,
  highlightJobId,
  pollingJobId,
  isLoading,
  onViewDetail,
}: {
  jobs: Job[];
  highlightJobId: string | null;
  pollingJobId: string | null;
  isLoading: boolean;
  onViewDetail: (job: Job) => void;
}) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={6} className="px-6 py-12 text-center">
          <Loader2 className="animate-spin mx-auto text-zinc-400" />
        </td>
      </tr>
    );
  }

  if (jobs.length === 0) {
    return (
      <tr>
        <td
          colSpan={6}
          className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400"
        >
          No jobs found
        </td>
      </tr>
    );
  }

  return (
    <>
      {jobs.map((job) => (
        <JobRow
          key={job.job_id}
          job={job}
          isHighlighted={highlightJobId === job.job_id}
          isPolling={pollingJobId === job.job_id}
          onViewDetail={onViewDetail}
        />
      ))}
    </>
  );
});

function HistoryContent() {
  const { apiKey } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightJobId = searchParams.get("job");
  const { playSuccess, playError } = useSoundSettings();
  const hasPlayedSound = useRef(false);

  const [offset, setOffset] = useState(0);
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { jobs, count, isLoading, error, mutate } = useJobs(
    apiKey,
    HISTORY_LIMIT,
    offset
  );

  // Exponential backoff polling for highlighted job
  const [pollInterval, setPollInterval] = useState(2000);
  const [attempts, setAttempts] = useState(0);

  const finalizedStatuses = useMemo(
    () => ["approved", "rejected", "failed", "timeout"],
    []
  );

  // Get highlighted job data using SWR
  const { job: highlightedJob } = useJob(apiKey, highlightJobId);

  // Reset sound flag when highlightJobId changes
  useEffect(() => {
    hasPlayedSound.current = false;
  }, [highlightJobId]);

  // Poll with exponential backoff
  useEffect(() => {
    if (!highlightJobId || !apiKey) {
      setPollingJobId(null);
      setPollInterval(2000);
      setAttempts(0);
      return;
    }

    const highlightedJobData = jobs.find((j) => j.job_id === highlightJobId);
    if (
      highlightedJobData &&
      finalizedStatuses.includes(highlightedJobData.status)
    ) {
      setPollingJobId(null);
      return;
    }

    setPollingJobId(highlightJobId);

    const poll = async () => {
      // Update jobs list via mutate
      await mutate();

      // Check if job is finalized
      const currentJob = jobs.find((j) => j.job_id === highlightJobId);
      if (currentJob && finalizedStatuses.includes(currentJob.status)) {
        setPollingJobId(null);
        setPollInterval(2000);
        setAttempts(0);

        if (currentJob.status === "approved") {
          toast.success("Verification approved!");
          if (!hasPlayedSound.current) {
            playSuccess();
            hasPlayedSound.current = true;
          }
        } else if (currentJob.status === "rejected") {
          toast.error("Verification rejected");
          if (!hasPlayedSound.current) {
            playError();
            hasPlayedSound.current = true;
          }
        }
      } else {
        // Increase interval with exponential backoff, capped at 10s
        setAttempts((prev) => prev + 1);
        setPollInterval((prev) => Math.min(prev * 1.5, 10000));
      }
    };

    const timeoutId = setTimeout(poll, pollInterval);
    return () => clearTimeout(timeoutId);
  }, [
    highlightJobId,
    apiKey,
    jobs,
    mutate,
    finalizedStatuses,
    pollInterval,
    playSuccess,
    playError,
  ]);

  useEffect(() => {
    if (!apiKey) {
      router.push("/");
    }
  }, [apiKey, router]);

  const handleViewDetail = useCallback((job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedJob(null), 300);
  }, []);

  if (!apiKey) return null;

  const totalPages = Math.ceil(count / HISTORY_LIMIT);
  const currentPage = Math.floor(offset / HISTORY_LIMIT) + 1;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <JobDetailModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Job History
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              View your verification history (click Job ID for details)
            </p>
          </div>
          <button
            onClick={() => mutate()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error.message}</p>
          </div>
        )}

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
                <JobsTable
                  jobs={jobs}
                  highlightJobId={highlightJobId}
                  pollingJobId={pollingJobId}
                  isLoading={isLoading}
                  onViewDetail={handleViewDetail}
                />
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing {offset + 1}-{Math.min(offset + HISTORY_LIMIT, count)} of{" "}
                {count}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - HISTORY_LIMIT))}
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
                    setOffset(Math.min((totalPages - 1) * HISTORY_LIMIT, offset + HISTORY_LIMIT))
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

const LoadingState = memo(function LoadingState() {
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
});

export default function HistoryPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <HistoryContent />
    </Suspense>
  );
}
