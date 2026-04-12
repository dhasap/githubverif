"use client";

import { useState } from "react";
import { Shield, Plus, Trash2, Crown, User } from "lucide-react";
import { useAdminManager, SUPER_ADMIN_ID } from "@/lib/admin";
import { toast } from "sonner";

interface AdminManagerProps {
  currentUserId?: number;
}

export function AdminManager({ currentUserId }: AdminManagerProps) {
  const { adminIds, isLoaded, addAdmin, removeAdmin, superAdminId } =
    useAdminManager();
  const [newAdminId, setNewAdminId] = useState("");

  const handleAddAdmin = () => {
    const id = parseInt(newAdminId.trim(), 10);
    if (isNaN(id) || id <= 0) {
      toast.error("Please enter a valid user ID");
      return;
    }

    if (adminIds.includes(id)) {
      toast.error("User is already an admin");
      return;
    }

    addAdmin(id);
    setNewAdminId("");
    toast.success(`User ${id} added as admin`);
  };

  const handleRemoveAdmin = (id: number) => {
    if (id === superAdminId) {
      toast.error("Cannot remove super admin");
      return;
    }

    removeAdmin(id);
    toast.success(`User ${id} removed from admin`);
  };

  if (!isLoaded) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="animate-pulse h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
          <Shield size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Admin Management
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage admin access to this dashboard
          </p>
        </div>
      </div>

      {/* Add New Admin */}
      <div className="flex gap-2 mb-6">
        <input
          type="number"
          value={newAdminId}
          onChange={(e) => setNewAdminId(e.target.value)}
          placeholder="Enter user ID..."
          className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
        />
        <button
          onClick={handleAddAdmin}
          disabled={!newAdminId.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={18} />
          Add Admin
        </button>
      </div>

      {/* Admin List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          Current Admins ({adminIds.length})
        </h3>

        {adminIds.map((id) => (
          <div
            key={id}
            className={`flex items-center justify-between p-3 rounded-xl ${
              id === currentUserId
                ? "bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800"
                : "bg-zinc-50 dark:bg-zinc-800/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  id === superAdminId
                    ? "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                    : "bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
                }`}
              >
                {id === superAdminId ? <Crown size={16} /> : <User size={16} />}
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  User ID: {id}
                  {id === currentUserId && (
                    <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                      (You)
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {id === superAdminId
                    ? "Super Admin (cannot be removed)"
                    : "Admin"}
                </p>
              </div>
            </div>

            {id !== superAdminId && (
              <button
                onClick={() => handleRemoveAdmin(id)}
                className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Remove admin"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

        {adminIds.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
            No admins found
          </p>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> Admins can access this dashboard, manage
          broadcast notifications, and toggle maintenance mode. Super admin
          cannot be removed.
        </p>
      </div>
    </div>
  );
}
