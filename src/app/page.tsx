import {
  BookOpen,
  Brain,
  Calendar,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          <Sparkles className="h-4 w-4" />
          KI-gestützte Klausurvorbereitung
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Lerne smarter,{" "}
          <span className="text-indigo-600">nicht harder</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Fertige Klausurvorbereitungspakete mit KI-generierten Analysen,
          Trainingsaufgaben, Lernplänen und Karteikarten für deine
          MINT-Prüfungen.
        </p>
      </div>

      {/* Product Grid */}
      {products && products.length > 0 ? (
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mb-16 rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-lg text-gray-500">
            Aktuell sind keine Produkte verfügbar. Schau bald wieder vorbei!
          </p>
        </div>
      )}

      {/* Features */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
