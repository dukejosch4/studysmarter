import { AnalysisDashboard } from "@/components/analysis/AnalysisDashboard";

export default async function AnalysePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <AnalysisDashboard analysisId={id} />
    </div>
  );
}
