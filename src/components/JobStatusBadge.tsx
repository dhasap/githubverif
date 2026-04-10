"use client";

interface JobStatusBadgeProps {
  status: string;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  queued: {
    bg: "bg-amber-100 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    label: "Queued",
  },
  logging_in: {
    bg: "bg-blue-100 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    label: "Logging In",
  },
  verifying_otp: {
    bg: "bg-blue-100 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    label: "Verifying OTP",
  },
  checking_account: {
    bg: "bg-blue-100 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    label: "Checking Account",
  },
  generating_proof: {
    bg: "bg-blue-100 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    label: "Generating Proof",
  },
  submitting: {
    bg: "bg-blue-100 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    label: "Submitting",
  },
  pending: {
    bg: "bg-purple-100 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-300",
    label: "Pending",
  },
  approved: {
    bg: "bg-green-100 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-300",
    label: "Approved",
  },
  rejected: {
    bg: "bg-red-100 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-300",
    label: "Rejected",
  },
  failed: {
    bg: "bg-red-100 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-300",
    label: "Failed",
  },
  timeout: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    label: "Timeout",
  },
};

export default function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = statusConfig[status] || {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
