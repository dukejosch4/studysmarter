import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-900">
              StudySmarter
            </span>
          </div>
          <nav className="flex gap-6">
            <Link
              href="/datenschutz"
              className="text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              Datenschutz
            </Link>
            <Link
              href="/impressum"
              className="text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              Impressum
            </Link>
          </nav>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} StudySmarter
          </p>
        </div>
      </div>
    </footer>
  );
}
