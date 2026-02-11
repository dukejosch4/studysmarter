"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  Calendar,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";
import { UploadZone } from "@/components/upload/UploadZone";
import { FileList } from "@/components/upload/FileList";
import { Button } from "@/components/shared";
import { useUpload } from "@/hooks/useUpload";

export default function Home() {
  const router = useRouter();
  const {
    files,
    isUploading,
    error,
    addFiles,
    removeFile,
    setDocType,
    upload,
  } = useUpload();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartAnalysis = async () => {
    if (!files.length) return;
    setIsStarting(true);

    try {
      const uploaded = await upload();
      if (!uploaded.length) return;

      const documentIds = uploaded.map((d) => d.id);

      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analyse konnte nicht gestartet werden");
      }

      const data = await response.json();
      router.push(`/analyse/${data.analysisId}`);
    } catch (err) {
      console.error("Failed to start analysis:", err);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          <Sparkles className="h-4 w-4" />
          KI-gestützte Prüfungsvorbereitung
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Lerne smarter,{" "}
          <span className="text-indigo-600">nicht harder</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Lade deine Vorlesungsunterlagen hoch und erhalte datenbasierte
          Analysen, personalisierte Trainingsaufgaben und einen optimierten
          Lernplan.
        </p>
      </div>

      {/* Upload Section */}
      <div className="mb-8 space-y-6">
        <UploadZone
          onFilesAdded={addFiles}
          disabled={isUploading || isStarting}
        />

        <FileList
          files={files}
          onRemove={removeFile}
          onDocTypeChange={setDocType}
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {files.length > 0 && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleStartAnalysis}
              loading={isUploading || isStarting}
              disabled={!files.length}
            >
              {isUploading
                ? "Dateien werden hochgeladen..."
                : isStarting
                  ? "Analyse wird gestartet..."
                  : `${files.length} ${files.length === 1 ? "Datei" : "Dateien"} analysieren`}
            </Button>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={<Brain className="h-6 w-6" />}
          title="Themengewichtung"
          description="Erkennt die wichtigsten Themen und bewertet ihre Prüfungsrelevanz"
        />
        <FeatureCard
          icon={<Layers className="h-6 w-6" />}
          title="Aufgabentypen"
          description="Analysiert welche Aufgabenformate in der Prüfung drankommen"
        />
        <FeatureCard
          icon={<FileText className="h-6 w-6" />}
          title="10 Trainingsaufgaben"
          description="Prüfungsnahe Übungsaufgaben mit detaillierten Musterlösungen"
        />
        <FeatureCard
          icon={<Calendar className="h-6 w-6" />}
          title="7-Tage-Lernplan"
          description="Personalisierter Plan, priorisiert nach Themenrelevanz"
        />
        <FeatureCard
          icon={<BookOpen className="h-6 w-6" />}
          title="20 Karteikarten"
          description="Definitionen, Sätze und Beweistechniken zum Lernen"
        />
        <FeatureCard
          icon={<Sparkles className="h-6 w-6" />}
          title="PDF-Report"
          description="Professionelles Ergebnisdokument zum Herunterladen"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      <div className="mb-3 inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
        {icon}
      </div>
      <h3 className="mb-1 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
