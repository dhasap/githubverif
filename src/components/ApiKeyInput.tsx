"use client";

import { useState, useCallback, memo } from "react";
import { useStore } from "@/lib/store";
import { apiKeySchema } from "@/lib/validation";
import { Key, Loader2, ArrowRight, Bot } from "lucide-react";
import { toast } from "sonner";
import MaintenanceNotice from "./MaintenanceNotice";

interface ApiKeyInputProps {
  onSuccess?: () => void;
}

const ApiKeyInput = memo(function ApiKeyInput({ onSuccess }: ApiKeyInputProps) {
  const [inputKey, setInputKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const { setApiKey, fetchUser } = useStore();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();

    const formatCheck = apiKeySchema.safeParse(trimmed);
    if (!formatCheck.success) {
      toast.error(formatCheck.error.issues[0]?.message || "Invalid API key format");
      return;
    }

    setIsLoading(true);
    setIsMaintenance(false);

    try {
      setApiKey(trimmed);
      await fetchUser();
      toast.success("API key validated successfully!");
      onSuccess?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Invalid API key";

      if (errorMsg.includes("530") || errorMsg.includes("1033") || errorMsg.includes("tunnel")) {
        setIsMaintenance(true);
        toast.error("Server sedang maintenance. Silakan coba lagi nanti.");
      } else {
        toast.error(errorMsg);
        setInputKey("");
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputKey, setApiKey, fetchUser, onSuccess]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <img
          src="/logo.png"
          alt="DevPack"
          width={64}
          height={64}
          className="inline-block rounded-2xl mb-4"
        />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Welcome to DevPack
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Enter your API key to access the dashboard
        </p>
      </div>

      {isMaintenance && (
        <div className="mb-6">
          <MaintenanceNotice />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Key
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            size={20}
          />
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Enter your API key..."
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !inputKey.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Validating...
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-start gap-3">
          <Bot className="text-blue-600 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              How to get an API key?
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Message{" "}
              <a
                href="https://t.me/AutoGithubStudentVer_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                @AutoGithubStudentVer_bot
              </a>{" "}
              on Telegram and type{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs">
                /apikey
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ApiKeyInput;
