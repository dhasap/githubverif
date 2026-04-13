"use client";

import { useStore, useCredits } from "@/lib/store";
import { isAdmin } from "@/lib/admin";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, memo, useMemo } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/verify", label: "Verify", icon: "✅" },
  { href: "/history", label: "History", icon: "📋" },
  { href: "/referrals", label: "Referrals", icon: "🎁" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

const adminNavItem = { href: "/admin", label: "Admin", icon: "📊" };

const Header = memo(function Header() {
  const { apiKey, clearApiKey } = useStore();
  const { user } = useCredits(apiKey);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Filter nav items based on admin status
  const navItems = useMemo(() => {
    if (isAdmin(user)) {
      // Insert admin item before settings
      return [
        ...baseNavItems.slice(0, -1),
        adminNavItem,
        baseNavItems[baseNavItems.length - 1],
      ];
    }
    return baseNavItems;
  }, [user]);

  const handleLogout = () => {
    clearApiKey();
    window.location.href = "/";
  };

  if (!apiKey) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="DevPack"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            DevPack
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Credits Badge */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {user.api_credits_available.toFixed(1)} credits
              </span>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              {user && (
                <div className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                  User ID: {user.user_id}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
});

export default Header;
