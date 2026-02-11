"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useSession } from "@/hooks/useSession";

type AnalysisSummary = {
  id: string;
  status: string;
  stage: number;
  total_pages: number;
  created_at: string;
  documents: Array<{ file_name: string }>;
};

export default function ErgebnissePage() {
  const { isAuthenticated, isLoading: authLoading } = useSession();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        const response = await fetch("/api/analyses");
        if (response.ok) {
          const data = await response.json();
          setAnalyses(data.analyses || []);
        }
      } catch (err) {
        console.error("Failed to fetch analyses:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalyses();
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Laden...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Anmeldung erforderlich
        </h1>
        <p className="mt-2 text-gray-500">
          Melde dich an, um deine Analyse-Historie zu sehen.
        </p>
        <Link
          href="/anmelden"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Jetzt anmelden
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Meine Analysen
      </h1>

      {isLoading ? (
        <p className="text-gray-500">Laden...</p>
      ) : analyses.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">
            Du hast noch keine Analysen durchgeführt.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Erste Analyse starten
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Link
              key={analysis.id}
              href={`/analyse/${analysis.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {analysis.documents
                      .map((d) => d.file_name)
                      .join(", ")}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {new Date(analysis.created_at).toLocaleDateString("de-DE")}
                  </p>
                </div>
                {analysis.status === "completed" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : analysis.status === "failed" ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
