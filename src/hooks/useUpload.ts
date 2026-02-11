"use client";

import { useState, useCallback } from "react";

type UploadedDocument = {
  id: string;
  fileName: string;
  fileSize: number;
  storagePath: string;
};

type FileWithType = {
  file: File;
  docType: string;
};

type UseUploadReturn = {
  files: FileWithType[];
  uploadedDocuments: UploadedDocument[];
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  setDocType: (index: number, docType: string) => void;
  upload: () => Promise<UploadedDocument[]>;
  reset: () => void;
};

export function useUpload(): UseUploadReturn {
  const [files, setFiles] = useState<FileWithType[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    const filesWithType = newFiles.map((file) => ({
      file,
      docType: "lecture_script",
    }));
    setFiles((prev) => [...prev, ...filesWithType]);
    setError(null);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const setDocType = useCallback((index: number, docType: string) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, docType } : f))
    );
  }, []);

  const upload = useCallback(async (): Promise<UploadedDocument[]> => {
    if (!files.length) {
      setError("No files selected");
      return [];
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(({ file, docType }) => {
        formData.append("files", file);
        formData.append(`docType_${file.name}`, docType);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setUploadedDocuments(data.documents);
      setUploadProgress(100);
      return data.documents;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [files]);

  const reset = useCallback(() => {
    setFiles([]);
    setUploadedDocuments([]);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    files,
    uploadedDocuments,
    isUploading,
    uploadProgress,
    error,
    addFiles,
    removeFile,
    setDocType,
    upload,
    reset,
  };
}
