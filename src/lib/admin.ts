"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCredits } from "./store";

// Default super admin - cannot be removed
export const SUPER_ADMIN_ID = 6359184586;

const ADMIN_LIST_KEY = "devpack-admin-ids";

// Get admin IDs from localStorage
function getAdminIds(): number[] {
  if (typeof window === "undefined") return [SUPER_ADMIN_ID];

  try {
    const saved = localStorage.getItem(ADMIN_LIST_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Always ensure super admin is in the list
      if (!parsed.includes(SUPER_ADMIN_ID)) {
        return [SUPER_ADMIN_ID, ...parsed];
      }
      return parsed;
    }
  } catch {
    // Ignore error
  }

  return [SUPER_ADMIN_ID];
}

// Save admin IDs to localStorage
function saveAdminIds(ids: number[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_LIST_KEY, JSON.stringify(ids));
}

// Check if user is admin - SSR safe
export function isAdmin(user: UserCredits | null | undefined): boolean {
  if (typeof window === "undefined") return false;
  if (!user) return false;
  const adminIds = getAdminIds();
  return adminIds.includes(user.user_id);
}

// Check if user ID is admin - SSR safe
export function checkIsAdmin(userId: number | undefined): boolean {
  if (typeof window === "undefined") return false;
  if (!userId) return false;
  const adminIds = getAdminIds();
  return adminIds.includes(userId);
}

// Check if user is super admin
export function isSuperAdmin(user: UserCredits | null | undefined): boolean {
  if (!user) return false;
  return user.user_id === SUPER_ADMIN_ID;
}

// Hook for managing admins
export function useAdminManager() {
  const [adminIds, setAdminIds] = useState<number[]>([SUPER_ADMIN_ID]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setAdminIds(getAdminIds());
    setIsLoaded(true);
  }, []);

  const addAdmin = useCallback((userId: number) => {
    setAdminIds((prev) => {
      if (prev.includes(userId)) return prev;
      const updated = [...prev, userId];
      saveAdminIds(updated);
      return updated;
    });
  }, []);

  const removeAdmin = useCallback((userId: number) => {
    // Cannot remove super admin
    if (userId === SUPER_ADMIN_ID) return;

    setAdminIds((prev) => {
      const updated = prev.filter((id) => id !== userId);
      saveAdminIds(updated);
      return updated;
    });
  }, []);

  const isAdmin = useCallback(
    (userId: number) => {
      return adminIds.includes(userId);
    },
    [adminIds]
  );

  return {
    adminIds,
    isLoaded,
    addAdmin,
    removeAdmin,
    isAdmin,
    superAdminId: SUPER_ADMIN_ID,
  };
}
