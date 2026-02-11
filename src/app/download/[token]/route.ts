import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return new NextResponse("Ungültiger Download-Link.", { status: 400 });
    }

    const supabase = createAdminClient();

    // Look up order by download token
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, products(analysis_id)")
      .eq("download_token", token)
      .eq("status", "confirmed")
      .single();

    if (error || !order) {
      return new NextResponse(
        "Download-Link ungültig oder bereits abgelaufen.",
        { status: 404 }
      );
    }

    // Check expiration
    if (
      order.download_token_expires_at &&
      new Date(order.download_token_expires_at) < new Date()
    ) {
      // Mark as expired
      await supabase
        .from("orders")
        .update({ status: "expired" })
        .eq("id", order.id);

      return new NextResponse(
        "Dieser Download-Link ist abgelaufen. Bitte kontaktiere uns für einen neuen Link.",
        { status: 410 }
      );
    }

    // Get the analysis report URL
    const product = order.products as { analysis_id: string };
    const { data: analysis } = await supabase
      .from("analyses")
      .select("result_report_url")
      .eq("id", product.analysis_id)
      .single();

    if (!analysis?.result_report_url) {
      return new NextResponse(
        "Report ist noch nicht verfügbar.",
        { status: 404 }
      );
    }

    // Generate signed URL from Supabase Storage
    const { data: signedUrl, error: signError } = await supabase.storage
      .from("reports")
      .createSignedUrl(analysis.result_report_url, 60 * 5); // 5 min

    if (signError || !signedUrl) {
      console.error("Signed URL error:", signError);
      return new NextResponse("Download fehlgeschlagen.", { status: 500 });
    }

    return NextResponse.redirect(signedUrl.signedUrl);
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Interner Fehler.", { status: 500 });
  }
}
