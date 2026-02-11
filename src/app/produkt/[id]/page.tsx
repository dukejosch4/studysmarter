import { notFound } from "next/navigation";
import { ArrowLeft, Brain, FileText, BookOpen, Lock } from "lucide-react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/shared";
import { PurchaseForm } from "@/components/catalog/PurchaseForm";
import type { ProductWithAnalysis } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, analyses(*)")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (!product) {
    notFound();
  }

  const p = product as ProductWithAnalysis;
  const analysis = p.analyses;

  const conceptCount = analysis?.result_concepts?.length || 0;
  const examCount = analysis?.result_exam_problems?.length || 0;
  const flashcardCount = analysis?.result_flashcards?.length || 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück zum Katalog
      </Link>

      <div className="mb-4">
        <Badge>{p.subject}</Badge>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-gray-900">{p.title}</h1>

      {p.description && (
        <p className="mb-8 text-lg text-gray-600">{p.description}</p>
      )}

      {/* Content Summary */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <Brain className="mx-auto mb-2 h-6 w-6 text-indigo-600" />
          <p className="text-2xl font-bold text-gray-900">{conceptCount}</p>
          <p className="text-sm text-gray-500">Konzepte</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <FileText className="mx-auto mb-2 h-6 w-6 text-indigo-600" />
          <p className="text-2xl font-bold text-gray-900">{examCount}</p>
          <p className="text-sm text-gray-500">Aufgaben</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <BookOpen className="mx-auto mb-2 h-6 w-6 text-indigo-600" />
          <p className="text-2xl font-bold text-gray-900">{flashcardCount}</p>
          <p className="text-sm text-gray-500">Karteikarten</p>
        </div>
      </div>

      {/* Blurred Preview */}
      <div className="relative mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white p-6">
        <div className="pointer-events-none select-none blur-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Enthaltene Inhalte
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Themengewichtung mit Prüfungsrelevanz-Scores</li>
            <li>Aufgabentyp-Analyse (Berechnung, Beweis, MC, ...)</li>
            <li>{examCount} prüfungsnahe Trainingsaufgaben mit Lösungen</li>
            <li>7-Tage-Lernplan, priorisiert nach Relevanz</li>
            <li>{flashcardCount} Karteikarten (Definitionen, Sätze, Formeln)</li>
            <li>Professioneller PDF-Report zum Download</li>
          </ul>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <Lock className="h-8 w-8" />
            <p className="text-sm font-medium">Nach dem Kauf verfügbar</p>
          </div>
        </div>
      </div>

      {/* Purchase Form */}
      <PurchaseForm
        productId={p.id}
        productTitle={p.title}
        priceEur={Number(p.price_eur)}
      />
    </div>
  );
}
