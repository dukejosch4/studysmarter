import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paypalWebhookSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/helpers";
import { checkRateLimit } from "@/lib/utils/rate-limiter";

const CREDIT_PRICE_EUR = 2;

export async function POST(request: NextRequest) {
  try {
    // Rate limit webhooks: 30 per minute per IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(`webhook:paypal:${ip}`, { maxRequests: 30, windowMs: 60000 });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const validation = validateBody(paypalWebhookSchema, body);
    if ("error" in validation) return validation.error;
    const payload = validation.data;

    // Only process completed orders
    if (payload.event_type !== "CHECKOUT.ORDER.APPROVED" &&
        payload.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
      return NextResponse.json({ received: true });
    }

    const orderId = payload.resource.id;
    const purchaseUnit = payload.resource.purchase_units?.[0];

    if (!purchaseUnit) {
      console.error("PayPal webhook: No purchase unit found");
      return NextResponse.json({ received: true });
    }

    const amountEur = parseFloat(purchaseUnit.amount.value);
    if (isNaN(amountEur) || amountEur <= 0) {
      console.error("PayPal webhook: Invalid amount");
      return NextResponse.json({ received: true });
    }

    const sessionId = purchaseUnit.custom_id;

    if (!sessionId) {
      console.error("PayPal webhook: No session ID in custom_id");
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    // Idempotency check
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("paypal_order_id", orderId)
      .single();

    if (existingPayment) {
      console.log(`PayPal webhook: Order ${orderId} already processed`);
      return NextResponse.json({ received: true });
    }

    const creditsGranted = Math.max(1, Math.floor(amountEur / CREDIT_PRICE_EUR));

    const { data: session } = await supabase
      .from("sessions")
      .select("id, user_id, credits")
      .eq("id", sessionId)
      .single();

    if (!session) {
      console.error(`PayPal webhook: Session ${sessionId} not found`);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { error: paymentError } = await supabase.from("payments").insert({
      session_id: sessionId,
      user_id: session.user_id,
      paypal_order_id: orderId,
      amount_eur: amountEur,
      credits_granted: creditsGranted,
      status: "completed",
    });

    if (paymentError) {
      console.error("PayPal webhook: Failed to record payment:", paymentError);
      return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
    }

    await supabase
      .from("sessions")
      .update({ credits: (session.credits as number) + creditsGranted })
      .eq("id", sessionId);

    if (session.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", session.user_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ credits: (profile.credits as number) + creditsGranted })
          .eq("id", session.user_id);
      }
    }

    console.log(`PayPal webhook: Granted ${creditsGranted} credits for order ${orderId} (${amountEur} EUR)`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
