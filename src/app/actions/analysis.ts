"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateSession } from "./session";
import { createClient } from "@/lib/supabase/server";

export async function startAnalysis(documentIds: string[]) {
  if (!documentIds.length) {
    throw new Error("No documents provided");
  }

  const session = await getOrCreateSession();

  // Check credits
  if (session.credits < 1) {
    throw new Error("No credits remaining. Please purchase more credits.");
  }

  const supabase = createAdminClient();

  // Check if user is logged in
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  // Create analysis
  const { data: analysis, error } = await supabase
    .from("analyses")
    .insert({
      session_id: session.id,
      user_id: user?.id ?? null,
      status: "pending" as const,
      stage: 0,
    })
    .select()
    .single();

  if (error) throw error;

  // Link documents to analysis
  const { error: docError } = await supabase
    .from("documents")
    .update({ analysis_id: analysis.id })
    .in("id", documentIds);

  if (docError) throw docError;

  // Deduct credit
  await supabase
    .from("sessions")
    .update({ credits: session.credits - 1 })
    .eq("id", session.id);

  // Trigger pipeline processing
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  fetch(`${appUrl}/api/pipeline/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PIPELINE_SECRET}`,
    },
    body: JSON.stringify({ analysisId: analysis.id }),
  }).catch(console.error); // Fire and forget

  return { analysisId: analysis.id };
}

export async function cancelAnalysis(analysisId: string) {
  const session = await getOrCreateSession();
  const supabase = createAdminClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .eq("session_id", session.id)
    .single();

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  if (analysis.status === "completed" || analysis.status === "failed") {
    throw new Error("Analysis already finished");
  }

  const { error } = await supabase
    .from("analyses")
    .update({ status: "failed" as const, error_message: "Cancelled by user" })
    .eq("id", analysisId);

  if (error) throw error;

  return { success: true };
}
