/**
 * Optimized store with SWR for data fetching and caching
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import useSWR, { SWRConfiguration, mutate } from "swr";

export interface UserCredits {
  user_id: number;
  api_credits_available: number;
  api_credits_locked: number;
  api_credits_total: number;
  bot_credits_available: number;
  bot_credits_locked: number;
  total_verifications: number;
  referrals: number;
  referral_credits_earned: number;
  joined_at: string;
}

export interface Job {
  job_id: string;
  status: string;
  role: string;
  message: string;
  app_id?: string;
  credits_charged?: number;
  credits_remaining?: number;
  elapsed_seconds?: number;
  created_at: string;
  updated_at: string;
}

// SWR fetcher
const fetcher = async ([url, apiKey]: [string, string | null]) => {
  if (!apiKey) throw new Error("No API key");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));

    if (res.status === 503 || err.maintenance) {
      throw new Error(err.error || "Server sedang maintenance");
    }

    if (res.status === 401) {
      throw new Error("Invalid API key");
    }

    throw new Error(err.error || err.details || "Request failed");
  }

  return res.json();
};

// SWR default config
const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
};

// --- Hooks for data fetching ---

export function useCredits(apiKey: string | null) {
  const { data, error, isLoading, mutate } = useSWR<UserCredits>(
    apiKey ? ["/api/credits", apiKey] : null,
    (args) => fetcher(args as [string, string | null]),
    {
      ...swrConfig,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    user: data,
    error,
    isLoading,
    mutate,
  };
}

export function useJobs(apiKey: string | null, limit = 10, offset = 0) {
  const { data, error, isLoading, mutate } = useSWR<{ jobs: Job[]; count: number }>(
    apiKey ? [`/api/jobs?limit=${limit}&offset=${offset}`, apiKey] : null,
    (args) => fetcher(args as [string, string | null]),
    swrConfig
  );

  return {
    jobs: data?.jobs || [],
    count: data?.count || 0,
    error,
    isLoading,
    mutate,
  };
}

export function useJob(apiKey: string | null, jobId: string | null) {
  const { data, error, isLoading } = useSWR<Job>(
    apiKey && jobId ? [`/api/job/${jobId}`, apiKey] : null,
    (args) => fetcher(args as [string, string | null]),
    {
      ...swrConfig,
      refreshInterval: (data) => {
        // Stop polling if job is finalized
        const finalizedStatuses = ["approved", "rejected", "failed", "timeout"];
        if (data && finalizedStatuses.includes(data.status)) {
          return 0;
        }
        return 3000; // Poll every 3 seconds
      },
    }
  );

  return {
    job: data,
    error,
    isLoading,
  };
}

// --- Main Store ---

interface AppState {
  apiKey: string | null;
  isMaintenance: boolean;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  fetchUser: () => Promise<void>;
  fetchJobs: (limit?: number, offset?: number) => Promise<{ jobs: Job[]; count: number }>;
  submitVerification: (data: {
    email: string;
    password: string;
    role: string;
    otp?: string;
    totp_secret?: string;
  }) => Promise<{ job_id: string; status: string }>;
  fetchJob: (jobId: string) => Promise<Job>;
  revokeApiKey: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      apiKey: null,
      isMaintenance: false,

      setApiKey: (key: string) => {
        set({ apiKey: key, isMaintenance: false });
      },

      clearApiKey: () => {
        set({ apiKey: null, isMaintenance: false });
      },

      fetchUser: async () => {
        const { apiKey } = get();
        if (!apiKey) throw new Error("No API key");

        const res = await fetch("/api/credits", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));

          if (res.status === 503 || err.maintenance) {
            set({ isMaintenance: true });
            throw new Error(err.error || "Server sedang maintenance. Silakan coba lagi dalam 1-2 jam.");
          }

          if (res.status === 401) {
            set({ apiKey: null });
            throw new Error("Invalid API key");
          }

          throw new Error(err.error || err.details || "Failed to fetch user data");
        }

        set({ isMaintenance: false });
      },

      fetchJobs: async (limit = 10, offset = 0) => {
        const { apiKey } = get();
        if (!apiKey) throw new Error("No API key");

        const res = await fetch(
          `/api/jobs?limit=${limit}&offset=${offset}`,
          {
            headers: { Authorization: `Bearer ${apiKey}` },
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));

          if (res.status === 503 || err.maintenance) {
            throw new Error(err.error || "Server sedang maintenance");
          }

          throw new Error(err.error || "Failed to fetch jobs");
        }
        return await res.json();
      },

      submitVerification: async (data) => {
        const { apiKey } = get();
        if (!apiKey) throw new Error("No API key");

        const res = await fetch("/api/verify", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));

          if (res.status === 503 || err.maintenance) {
            set({ isMaintenance: true });
            throw new Error(err.error || "Server sedang maintenance");
          }

          throw new Error(err.error || err.message || "Verification failed");
        }

        // Invalidate jobs cache after new submission
        mutate(["/api/jobs?limit=10&offset=0", apiKey]);

        return await res.json();
      },

      fetchJob: async (jobId: string) => {
        const { apiKey } = get();
        if (!apiKey) throw new Error("No API key");

        const res = await fetch(`/api/job/${jobId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to fetch job");
        }
        return await res.json();
      },

      revokeApiKey: async () => {
        const { apiKey } = get();
        if (!apiKey) throw new Error("No API key");

        const res = await fetch("/api/apikey/revoke", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to revoke API key");
        }
        set({ apiKey: null });
      },
    }),
    {
      name: "devpack-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
);
