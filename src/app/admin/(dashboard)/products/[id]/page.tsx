"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/shared";
import { PipelineProgress } from "@/components/analysis/PipelineProgress";
import type { ProductWithAnalysis } from "@/types";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<ProductWithAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Editable fields
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priceEur, setPriceEur] = useState("");

  const fetchProduct = () => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setTitle(data.product.title);
          setSubject(data.product.subject);
          setDescription(data.product.description || "");
          setPriceEur(String(data.product.price_eur));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProduct();
    // Poll for pipeline updates
    const interval = setInterval(fetchProduct, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject,
          description,
          price_eur: parseFloat(priceEur),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Speichern fehlgeschlagen");
      }
      const data = await res.json();
      setProduct(data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !product?.is_published }),
      });
      if (res.ok) {
        const data = await res.json();
        setProduct(data.product);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Produkt wirklich löschen?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-gray-500">Produkt nicht gefunden.</p>;
  }

  const analysis = product.analyses;
  const isPipelineRunning =
    analysis && analysis.status !== "completed" && analysis.status !== "failed";

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produkt bearbeiten</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTogglePublish}
            loading={saving}
            disabled={analysis?.status !== "completed"}
          >
            {product.is_published ? "Unpublish" : "Publish"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Pipeline Progress */}
      {analysis && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <PipelineProgress
            currentStage={analysis.stage}
            status={analysis.status}
            errorMessage={analysis.error_message}
            totalPages={analysis.total_pages}
          />
        </div>
      )}

      {/* Edit Form */}
      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Titel</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fach</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preis (EUR)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={priceEur}
            onChange={(e) => setPriceEur(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button onClick={handleSave} loading={saving} className="w-full">
          Speichern
        </Button>

        {/* Analysis Summary */}
        {analysis?.status === "completed" && (
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Analyse-Ergebnisse</h3>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-2xl font-bold text-indigo-600">
                  {analysis.result_concepts?.length || 0}
                </p>
                <p className="text-gray-500">Konzepte</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600">
                  {analysis.result_exam_problems?.length || 0}
                </p>
                <p className="text-gray-500">Aufgaben</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600">
                  {analysis.result_flashcards?.length || 0}
                </p>
                <p className="text-gray-500">Karteikarten</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
