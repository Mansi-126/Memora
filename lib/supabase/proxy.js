import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./key";

/**
 * Refreshes the Supabase session from cookies and enforces auth on /dashboard.
 */
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value)
        );
      },
    },
  });

  const { pathname } = request.nextUrl;

  const { data } = await supabase.auth.getClaims();

  if (pathname.startsWith("/auth/callback")) {
    return supabaseResponse;
  }

  if (pathname.startsWith("/dashboard")) {
    if (!data?.claims) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/login" && data?.claims) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}
