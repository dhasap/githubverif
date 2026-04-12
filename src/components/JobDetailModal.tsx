"use client";

import { useEffect, useState, memo } from "react";
import { X, Clock, Calendar, CreditCard, FileText, Hash, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { Job } from "@/lib/store";
import JobStatusBadge from "./JobStatusBadge";

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetailModal = memo(function JobDetailModal({
  job,
  isOpen,
  onClose,
}: JobDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isOpen || !job) return;

    // Store original overflow and disable scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setIsAnimating(true);

    // Restore scrolling when modal closes or unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, job]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  if (!isOpen || !job) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: "text-green-600 bg-green-50 dark:bg-green-950/20",
      rejected: "text-red-600 bg-red-50 dark:bg-red-950/20",
      failed: "text-red-600 bg-red-50 dark:bg-red-950/20",
      timeout: "text-amber-600 bg-amber-50 dark:bg-amber-950/20",
      pending: "text-purple-600 bg-purple-50 dark:bg-purple-950/20",
      queued: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
    };
    return colors[status] || "text-zinc-600 bg-zinc-50 dark:bg-zinc-800";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Job Details
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                View full information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job ID */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Job ID</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
                {job.job_id}
              </code>
              <button
                onClick={() => handleCopy(job.job_id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Status</span>
            <JobStatusBadge status={job.status} />
          </div>

          {/* Role */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Role</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {(job.role?.trim() || "student").replace(/^\w/, (c) => c.toUpperCase())}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Timestamps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Created</span>
              </div>
              <span className="text-sm text-zinc-900 dark:text-zinc-100">
                {formatDate(job.created_at)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Updated</span>
              </div>
              <span className="text-sm text-zinc-900 dark:text-zinc-100">
                {formatDate(job.updated_at)}
              </span>
            </div>

            {job.elapsed_seconds !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  {job.elapsed_seconds}s
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Credits */}
          <div className="space-y-3">
            {job.credits_charged !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Credits Charged</span>
                </div>
                <span
                  className={`text-sm font-medium px-2 py-0.5 rounded ${
                    job.credits_charged > 0
                      ? "text-red-600 bg-red-50 dark:bg-red-950/20"
                      : "text-green-600 bg-green-50 dark:bg-green-950/20"
                  }`}
                >
                  {job.credits_charged}
                </span>
              </div>
            )}

            {job.credits_remaining !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Credits Remaining</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {job.credits_remaining}
                </span>
              </div>
            )}
          </div>

          {/* Message */}
          {job.message && (
            <>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Message</p>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">{job.message}</p>
              </div>
            </>
          )}

          {/* App ID Link */}
          {job.app_id && (
            <a
              href="https://education.github.com/students"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
            >
              <span className="text-sm font-medium">View on GitHub Education</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
});

export default JobDetailModal;
