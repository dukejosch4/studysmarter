"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, EyeOff } from "lucide-react";
import { Button, Badge } from "@/components/shared";
import type { ProductWithAnalysis } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produkte</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            Neues Produkt
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">Noch keine Produkte erstellt.</p>
          <Link href="/admin/products/new" className="mt-4 inline-block">
            <Button variant="outline">Erstes Produkt erstellen</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Titel</th>
                <th className="px-6 py-3 font-medium text-gray-500">Fach</th>
                <th className="px-6 py-3 font-medium text-gray-500">Preis</th>
                <th className="px-6 py-3 font-medium text-gray-500">Pipeline</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {product.title}
                  </td>
                  <td className="px-6 py-4">
                    <Badge size="sm">{product.subject}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {Number(product.price_eur).toFixed(2)} &euro;
                  </td>
                  <td className="px-6 py-4">
                    <PipelineStatusBadge status={product.analyses?.status} />
                  </td>
                  <td className="px-6 py-4">
                    {product.is_published ? (
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <Eye className="h-3.5 w-3.5" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <EyeOff className="h-3.5 w-3.5" /> Entwurf
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PipelineStatusBadge({ status }: { status?: string }) {
  if (!status) return <Badge variant="secondary" size="sm">-</Badge>;
  const map: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "secondary" }> = {
    pending: { label: "Wartend", variant: "secondary" },
    uploading: { label: "Upload", variant: "default" },
    extracting: { label: "Extraktion", variant: "warning" },
    analyzing: { label: "Analyse", variant: "default" },
    generating: { label: "Generierung", variant: "default" },
    completed: { label: "Fertig", variant: "success" },
    failed: { label: "Fehler", variant: "error" },
  };
  const config = map[status] || map.pending;
  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
}
