"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadZoneProps = {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
};

export function UploadZone({
  onFilesAdded,
  disabled = false,
  maxFiles = 50,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAdded(acceptedFiles);
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
      },
      maxFiles,
      maxSize: 50 * 1024 * 1024, // 50MB
      disabled,
    });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all sm:p-12",
        isDragActive && !isDragReject &&
          "border-indigo-400 bg-indigo-50",
        isDragReject && "border-red-400 bg-red-50",
        !isDragActive &&
          !isDragReject &&
          "border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "rounded-xl p-4 transition-colors",
            isDragActive ? "bg-indigo-100" : "bg-white shadow-sm"
          )}
        >
          {isDragActive ? (
            <FileText className="h-10 w-10 text-indigo-600" />
          ) : (
            <Upload className="h-10 w-10 text-gray-400" />
          )}
        </div>

        {isDragReject ? (
          <div>
            <p className="text-base font-semibold text-red-600">
              Nur PDF-Dateien erlaubt
            </p>
            <p className="mt-1 text-sm text-red-500">
              Bitte lade nur PDF-Dateien hoch
            </p>
          </div>
        ) : isDragActive ? (
          <div>
            <p className="text-base font-semibold text-indigo-600">
              Dateien hier ablegen
            </p>
          </div>
        ) : (
          <div>
            <p className="text-base font-semibold text-gray-700">
              PDFs hochladen
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Ziehe deine Vorlesungsunterlagen hierher oder{" "}
              <span className="text-indigo-600 underline">durchsuche</span>{" "}
              deinen Computer
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Max. {maxFiles} Dateien, jeweils max. 50 MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
