import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  let next = safeInternalPath(url.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && isLikelyFirstSignIn(user)) {
        next = withSearchParams(next, { first_login: "1" });
      }
      return NextResponse.redirect(`${url.origin}${next}`);
    }
  }

  return NextResponse.redirect(`${url.origin}/login?error=auth`);
}
