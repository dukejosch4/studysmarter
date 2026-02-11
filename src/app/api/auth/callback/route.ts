import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Whitelist of allowed redirect paths (prevents open redirect)
const ALLOWED_REDIRECTS = ["/", "/dashboard", "/ergebnisse", "/analyse"];

function getSafeRedirect(next: string | null): string {
  if (!next) return "/";
  // Must be a relative path starting with /
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  // Must not contain protocol indicators
  if (next.includes("://") || next.includes("\\")) return "/";
  // Check against whitelist prefix
  const isAllowed = ALLOWED_REDIRECTS.some(
    (allowed) => next === allowed || next.startsWith(allowed + "/") || next.startsWith(allowed + "?")
  );
  return isAllowed ? next : "/";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirect(searchParams.get("next"));

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
