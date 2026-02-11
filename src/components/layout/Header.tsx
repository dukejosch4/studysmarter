"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">
            Study<span className="text-indigo-600">Smarter</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
