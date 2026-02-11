"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, GraduationCap, LogIn, User } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">
            Study<span className="text-indigo-600">Smarter</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {isAuthenticated && (
            <Link
              href="/ergebnisse"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Meine Analysen
            </Link>
          )}
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <Link
                  href="/ergebnisse"
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <User className="h-4 w-4" />
                  {user?.email?.split("@")[0] || "Account"}
                </Link>
              ) : (
                <Link
                  href="/anmelden"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  <LogIn className="h-4 w-4" />
                  Anmelden
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {isAuthenticated && (
              <Link
                href="/ergebnisse"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                Meine Analysen
              </Link>
            )}
            {!isLoading && !isAuthenticated && (
              <Link
                href="/anmelden"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                onClick={() => setMobileOpen(false)}
              >
                Anmelden
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
