"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Session } from "@/types";

const SESSION_COOKIE = "studysmarter_session_id";

export async function getOrCreateSession(): Promise<Session> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    throw new Error("No session cookie found");
  }

  const supabase = createAdminClient();

  // Check if session exists in DB
  const { data: existing } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (existing) {
    // Check if expired
    if (new Date(existing.expires_at) < new Date()) {
      // Renew session
      const { data: renewed, error } = await supabase
        .from("sessions")
        .update({
          expires_at: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error || !renewed) throw error || new Error("Failed to renew session");
      return renewed as Session;
    }
    return existing as Session;
  }

  // Check if user is logged in - link session to user
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  // Create new session in DB
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      id: sessionId,
      user_id: user?.id ?? null,
      credits: 1,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error || !session) throw error || new Error("Failed to create session");
  return session as Session;
}

export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) throw new Error("No session cookie found");
  return sessionId;
}
