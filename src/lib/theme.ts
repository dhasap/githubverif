"use client";

import { useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "light";

// Safe DOM operations
function safeApplyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function safeSaveTheme(theme: Theme) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("devpack-theme", theme);
}

function safeLoadTheme(): Theme {
  if (typeof localStorage === "undefined") return "light";
  const saved = localStorage.getItem("devpack-theme") as Theme | null;
  return saved || "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = safeLoadTheme();
    setThemeState(savedTheme);
    safeApplyTheme(savedTheme);
    setMounted(true);
  }, []);

  // Apply theme when it changes (after mount)
  useEffect(() => {
    if (mounted) {
      safeApplyTheme(theme);
      safeSaveTheme(theme);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return {
    theme,
    resolvedTheme: theme,
    mounted,
    setTheme,
    toggleTheme,
  };
}

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("devpack-theme") as Theme | null;
  return saved || "light";
}
