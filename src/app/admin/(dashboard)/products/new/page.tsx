"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/upload/UploadZone";
import { FileList } from "@/components/upload/FileList";
import { Button } from "@/components/shared";

type LocalFile = {
  file: File;
  docType: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priceEur, setPriceEur] = useState("");
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addFiles = (newFiles: File[]) => {
    const mapped = newFiles.map((f) => ({
      file: f,
      docType: "lecture_script",
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const setDocType = (index: number, docType: string) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, docType } : f))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length || !title || !subject || !priceEur) return;
    setError("");
    setLoading(true);

    try {
      // 1. Upload files
      const formData = new FormData();
      for (const f of files) {
        formData.append("files", f.file);
        formData.append(`docType_${f.file.name}`, f.docType);
      }

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || "Upload fehlgeschlagen");
      }

      const { documents } = await uploadRes.json();
      const documentIds = documents.map((d: { id: string }) => d.id);

      // 2. Create product + trigger pipeline
      const productRes = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject,
          description,
          price_eur: parseFloat(priceEur),
          documentIds,
        }),
      });

      if (!productRes.ok) {
        const data = await productRes.json();
        throw new Error(data.error || "Produkt konnte nicht erstellt werden");
      }

      const { product } = await productRes.json();
      router.push(`/admin/products/${product.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Neues Produkt</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Titel *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            placeholder="z.B. Analysis I — Klausurvorbereitung"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fach *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            placeholder="z.B. Mathematik, Physik, Informatik"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Beschreibung
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            placeholder="Kurzbeschreibung des Produkts..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preis (EUR) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={priceEur}
            onChange={(e) => setPriceEur(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            placeholder="9.99"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            PDF-Dateien *
          </label>
          <UploadZone onFilesAdded={addFiles} disabled={loading} />
          <div className="mt-4">
            <FileList
              files={files}
              onRemove={removeFile}
              onDocTypeChange={setDocType}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          disabled={!files.length || !title || !subject || !priceEur}
          className="w-full"
          size="lg"
        >
          {loading ? "Wird erstellt..." : "Produkt erstellen & Pipeline starten"}
        </Button>
      </form>
    </div>
  );
}
