import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

interface AppState {
  apiKey: string | null;
  user: UserCredits | null;
  isLoading: boolean;
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
      user: null,
      isLoading: false,
      isMaintenance: false,

      setApiKey: (key: string) => {
        set({ apiKey: key, isMaintenance: false });
      },

      clearApiKey: () => {
        set({ apiKey: null, user: null, isMaintenance: false });
      },

      fetchUser: async () => {
        const { apiKey } = get();
        if (!apiKey) throw new Error("No API key");

        const res = await fetch("/api/credits", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));

          // Check for maintenance mode
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
        const data = await res.json();
        set({ user: data });
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
            throw new Error(err.error || "Server sedang maintenance");
          }

          throw new Error(err.error || err.message || "Verification failed");
        }

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
        set({ apiKey: null, user: null });
      },
    }),
    {
      name: "devpack-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
);
