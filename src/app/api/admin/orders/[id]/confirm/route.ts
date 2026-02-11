import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";
import { sendDownloadEmail } from "@/lib/email/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth !== true) return auth;

    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch order with product
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*, products(*)")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Order is not pending" },
        { status: 400 }
      );
    }

    // Generate download token
    const downloadToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    // Update order
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "confirmed",
        download_token: downloadToken,
        download_token_expires_at: expiresAt.toISOString(),
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Order update error:", updateError);
      return NextResponse.json(
        { error: "Failed to confirm order" },
        { status: 500 }
      );
    }

    // Send email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const downloadUrl = `${appUrl}/download/${downloadToken}`;
    const product = order.products as { title: string };

    try {
      await sendDownloadEmail({
        to: order.customer_email,
        productTitle: product.title,
        downloadUrl,
        expiresAt,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the confirmation if email fails
    }

    return NextResponse.json({ success: true, downloadToken });
  } catch (error) {
    console.error("Order confirm error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
