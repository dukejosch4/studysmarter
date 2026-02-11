import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";
import { createProductSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/helpers";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth !== true) return auth;

    const supabase = createAdminClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("*, analyses(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error("Products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth !== true) return auth;

    const body = await request.json();
    const validation = validateBody(createProductSchema, body);
    if ("error" in validation) return validation.error;

    const { title, subject, description, price_eur, documentIds } = validation.data;

    const supabase = createAdminClient();
    const adminSessionId = process.env.ADMIN_SESSION_ID!;

    // Ensure admin session exists
    const { data: existingSession } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", adminSessionId)
      .single();

    if (!existingSession) {
      await supabase.from("sessions").insert({
        id: adminSessionId,
        credits: 9999,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Create analysis
    const analysisId = crypto.randomUUID();
    const { error: analysisError } = await supabase
      .from("analyses")
      .insert({
        id: analysisId,
        session_id: adminSessionId,
        status: "pending",
        stage: 0,
      });

    if (analysisError) {
      console.error("Analysis creation error:", analysisError);
      return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 });
    }

    // Link documents to analysis
    const { error: linkError } = await supabase
      .from("documents")
      .update({ analysis_id: analysisId })
      .in("id", documentIds);

    if (linkError) {
      console.error("Document link error:", linkError);
      return NextResponse.json({ error: "Failed to link documents" }, { status: 500 });
    }

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        analysis_id: analysisId,
        title,
        subject,
        description: description || "",
        price_eur,
        is_published: false,
      })
      .select()
      .single();

    if (productError) {
      console.error("Product creation error:", productError);
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    // Trigger pipeline
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    fetch(`${appUrl}/api/pipeline/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PIPELINE_SECRET}`,
      },
      body: JSON.stringify({ analysisId }),
    }).catch(console.error);

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
