import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth !== true) return auth;

    const supabase = createAdminClient();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, products(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error("Orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
