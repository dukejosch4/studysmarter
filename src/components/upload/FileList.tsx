"use client";

import { FileItem } from "./FileItem";
import { DocumentTypeSelector } from "./DocumentTypeSelector";

type FileWithType = {
  file: File;
  docType: string;
};

type FileListProps = {
  files: FileWithType[];
  onRemove: (index: number) => void;
  onDocTypeChange: (index: number, docType: string) => void;
};

export function FileList({ files, onRemove, onDocTypeChange }: FileListProps) {
  if (!files.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          {files.length} {files.length === 1 ? "Datei" : "Dateien"} ausgewählt
        </h3>
        <p className="text-xs text-gray-500">
          {formatTotalSize(files.map((f) => f.file.size))}
        </p>
      </div>
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {files.map((fileWithType, index) => (
          <div key={`${fileWithType.file.name}-${index}`} className="flex items-center gap-3 p-3">
            <FileItem
              file={fileWithType.file}
              onRemove={() => onRemove(index)}
            />
            <DocumentTypeSelector
              value={fileWithType.docType}
              onChange={(docType) => onDocTypeChange(index, docType)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTotalSize(sizes: number[]): string {
  const total = sizes.reduce((acc, size) => acc + size, 0);
  if (total < 1024) return `${total} B`;
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  return `${(total / (1024 * 1024)).toFixed(1)} MB`;
}
