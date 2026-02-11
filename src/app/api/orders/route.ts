import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/helpers";
import { checkRateLimit } from "@/lib/utils/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 orders per hour per IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(`order:${ip}`, {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = validateBody(createOrderSchema, body);
    if ("error" in validation) return validation.error;

    const { product_id, customer_email } = validation.data;

    const supabase = createAdminClient();

    // Verify product exists and is published
    const { data: product } = await supabase
      .from("products")
      .select("id, is_published, price_eur")
      .eq("id", product_id)
      .eq("is_published", true)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Produkt nicht gefunden" },
        { status: 404 }
      );
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        product_id,
        customer_email,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Bestellung konnte nicht erstellt werden" },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: { id: order.id } });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
