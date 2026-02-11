"use client";

import { FileText, X } from "lucide-react";

type FileItemProps = {
  file: File;
  onRemove: () => void;
};

export function FileItem({ file, onRemove }: FileItemProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <FileText className="h-5 w-5 shrink-0 text-indigo-500" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-700">
          {file.name}
        </p>
        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
        aria-label={`${file.name} entfernen`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
