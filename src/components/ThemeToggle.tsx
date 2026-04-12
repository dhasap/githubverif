"use client";

import { memo, useCallback } from "react";
import { useTheme } from "@/lib/theme";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = memo(function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  }, [toggleTheme]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg text-zinc-400 animate-pulse"
        aria-label="Loading theme"
        type="button"
      >
        <Sun size={20} />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`p-2 rounded-lg transition-all duration-200 ${
        isDark
          ? "text-yellow-400 hover:bg-yellow-400/10"
          : "text-zinc-600 hover:bg-zinc-100"
      }`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-5 h-5">
        <Sun
          size={20}
          className={`absolute inset-0 transition-all duration-200 ${
            isDark ? "rotate-90 opacity-0 scale-0" : "rotate-0 opacity-100 scale-100"
          }`}
        />
        <Moon
          size={20}
          className={`absolute inset-0 transition-all duration-200 ${
            isDark ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-0"
          }`}
        />
      </div>
    </button>
  );
});

export default ThemeToggle;
