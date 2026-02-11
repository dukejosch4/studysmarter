import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export function getSessionId(request: NextRequest): string | null {
  return request.cookies.get("studysmarter_session_id")?.value || null;
}

export function requireSession(request: NextRequest): { sessionId: string } | NextResponse {
  const sessionId = getSessionId(request);
  if (!sessionId) {
    return NextResponse.json({ error: "Keine Session gefunden" }, { status: 401 });
  }
  return { sessionId };
}

export function validateBody<T>(schema: z.ZodType<T>, data: unknown): { data: T } | { error: NextResponse } {
  try {
    const parsed = schema.parse(data);
    return { data: parsed };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        error: NextResponse.json(
          { error: "Ungültige Eingabe", details: e.issues },
          { status: 400 }
        ),
      };
    }
    return {
      error: NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 }),
    };
  }
}

export function validateQuery<T>(schema: z.ZodType<T>, searchParams: URLSearchParams): { data: T } | { error: NextResponse } {
  const obj = Object.fromEntries(searchParams.entries());
  return validateBody(schema, obj);
}
