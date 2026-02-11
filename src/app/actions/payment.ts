"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateSession } from "./session";
import { createClient } from "@/lib/supabase/server";

export async function recordPayment(paypalOrderId: string, amountEur: number) {
  const session = await getOrCreateSession();
  const supabase = createAdminClient();

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  // Calculate credits based on amount
  const creditsGranted = Math.floor(amountEur / 2); // 2 EUR per credit

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      session_id: session.id,
      user_id: user?.id ?? null,
      paypal_order_id: paypalOrderId,
      amount_eur: amountEur,
      credits_granted: creditsGranted,
      status: "completed" as const,
    })
    .select()
    .single();

  if (error) throw error;

  // Add credits to session
  await supabase
    .from("sessions")
    .update({ credits: session.credits + creditsGranted })
    .eq("id", session.id);

  // If user is logged in, also update profile credits
  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({ credits: profile.credits + creditsGranted })
        .eq("id", user.id);
    }
  }

  return { credits: creditsGranted };
}
