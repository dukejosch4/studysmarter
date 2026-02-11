"use client";

import { Download, FileText, Layers } from "lucide-react";
import { Button } from "@/components/shared";

type ExportButtonsProps = {
  analysisId: string;
  hasReport: boolean;
  hasFlashcards: boolean;
};

export function ExportButtons({
  analysisId,
  hasReport,
  hasFlashcards,
}: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {hasReport && (
        <Button
          variant="default"
          onClick={() =>
            window.open(
              `/api/export/pdf?analysisId=${analysisId}`,
              "_blank"
            )
          }
        >
          <FileText className="h-4 w-4" />
          PDF-Report herunterladen
        </Button>
      )}
      {hasFlashcards && (
        <Button
          variant="outline"
          onClick={() =>
            window.open(
              `/api/export/anki?analysisId=${analysisId}`,
              "_blank"
            )
          }
        >
          <Layers className="h-4 w-4" />
          Anki-Export
        </Button>
      )}
    </div>
  );
}
