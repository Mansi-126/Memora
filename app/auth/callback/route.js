import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/key";

function safeInternalPath(next) {
  if (!next || typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

/** Append query params to an internal path like `/dashboard` or `/dashboard/sources?x=1`. */
function withSearchParams(path, additions) {
  const q = path.indexOf("?");
  const pathname = q >= 0 ? path.slice(0, q) : path;
  const params = new URLSearchParams(q >= 0 ? path.slice(q + 1) : "");
  for (const [key, value] of Object.entries(additions)) {
    params.set(key, value);
  }
  const s = params.toString();
  return s ? `${pathname}?${s}` : pathname;
}

/** True when this OAuth completion likely created the account (first sign-in). */
function isLikelyFirstSignIn(user) {
  if (!user?.created_at || !user?.last_sign_in_at) return false;
  const created = new Date(user.created_at).getTime();
  const last = new Date(user.last_sign_in_at).getTime();
  if (Number.isNaN(created) || Number.isNaN(last)) return false;
  return last - created < 3 * 60 * 1000;
}

/**
 * OAuth callback: session cookies MUST be set on the same NextResponse that is returned.
 * Using cookies() from next/headers in Route Handlers often does not attach Set-Cookie to redirects (production).
 */
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  let next = safeInternalPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=auth`);
  }

  const redirectTarget = `${url.origin}${next}`;
  const response = NextResponse.redirect(redirectTarget);

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
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
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const hint = String(error.message || "exchange_failed").slice(0, 180);
    return NextResponse.redirect(
      `${url.origin}/login?error=auth&reason=${encodeURIComponent(hint)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && isLikelyFirstSignIn(user)) {
    next = withSearchParams(next, { first_login: "1" });
    response.headers.set("Location", `${url.origin}${next}`);
  }

  return response;
}
