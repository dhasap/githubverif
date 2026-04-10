"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Key, AlertTriangle, Loader2, RefreshCw, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { apiKey, user, clearApiKey, revokeApiKey, fetchUser } = useStore();
  const router = useRouter();
  const [newApiKey, setNewApiKey] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!apiKey) {
      router.push("/");
      return;
    }
    fetchUser();
  }, [apiKey, router, fetchUser]);

  const handleChangeKey = () => {
    if (!newApiKey.trim()) {
      toast.error("Please enter a new API key");
      return;
    }
    clearApiKey();
    useStore.getState().setApiKey(newApiKey.trim());
    useStore
      .getState()
      .fetchUser()
      .then(() => {
        toast.success("API key updated successfully!");
        setNewApiKey("");
      })
      .catch(() => {
        toast.error("Invalid API key");
        useStore.getState().clearApiKey();
      });
  };

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      await revokeApiKey();
      toast.success("API key revoked successfully");
      router.push("/");
    } catch (err) {
      toast.error("Failed to revoke API key");
    } finally {
      setIsRevoking(false);
      setShowConfirm(false);
    }
  };

  const handleLogout = () => {
    clearApiKey();
    toast.success("Logged out");
    router.push("/");
  };

  if (!apiKey) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Settings
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your API key and account
          </p>
        </div>

        <div className="space-y-6">
          {/* Change API Key */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                <RefreshCw size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Change API Key
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Switch to a different API key
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Enter new API key..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <button
                onClick={handleChangeKey}
                disabled={!newApiKey.trim()}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Update API Key
              </button>
            </div>
          </div>

          {/* Current API Key Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                <Key size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Current API Key
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Your active API key details
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Key</span>
                <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  {apiKey?.slice(0, 12)}...{apiKey?.slice(-4)}
                </code>
              </div>
              {user && (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">User ID</span>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{user.user_id}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Joined</span>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {new Date(user.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Revoke API Key */}
          <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Revoke API Key
                </h2>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Permanently revoke your current API key
                </p>
              </div>
            </div>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Revoke API Key
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  Are you sure? This action cannot be undone. You will need to generate a new key via Telegram.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRevoke}
                    disabled={isRevoking}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isRevoking ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Revoking...
                      </span>
                    ) : (
                      "Confirm Revoke"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
