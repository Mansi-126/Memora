"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ManageSpacePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    sources: 0,
    artifacts: 0,
    favorites: 0,
    folders: 0,
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [sourcesRes, artifactsRes, favoritesRes, foldersRes] = await Promise.all([
          fetch("/api/sources", { credentials: "include", cache: "no-store" }),
          fetch("/api/sources?source_type=artifact", { credentials: "include", cache: "no-store" }),
          fetch("/api/sources?is_favorite=true", { credentials: "include", cache: "no-store" }),
          fetch("/api/folders", { credentials: "include", cache: "no-store" }),
        ]);

        const [sourcesP, artifactsP, favoritesP, foldersP] = await Promise.all([
          sourcesRes.json().catch(() => ({})),
          artifactsRes.json().catch(() => ({})),
          favoritesRes.json().catch(() => ({})),
          foldersRes.json().catch(() => ({})),
        ]);

        if (!sourcesRes.ok) throw new Error(sourcesP.error || "Failed to load");
        if (!artifactsRes.ok) throw new Error(artifactsP.error || "Failed to load");
        if (!favoritesRes.ok) throw new Error(favoritesP.error || "Failed to load");
        if (!foldersRes.ok) throw new Error(foldersP.error || "Failed to load");

        if (cancelled) return;

        setStats({
          sources: Array.isArray(sourcesP.data) ? sourcesP.data.length : 0,
          artifacts: Array.isArray(artifactsP.data) ? artifactsP.data.length : 0,
          favorites: Array.isArray(favoritesP.data) ? favoritesP.data.length : 0,
          folders: Array.isArray(foldersP.data) ? foldersP.data.length : 0,
        });
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = useMemo(() => {
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.first_name ||
      user?.email ||
      "Account"
    );
  }, [user]);

  const initial = useMemo(() => {
    const s = String(displayName).trim();
    return s ? s[0].toUpperCase() : "?";
  }, [displayName]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/dashboard/sources", label: "Sources", n: stats.sources },
    { href: "/dashboard/artifacts", label: "Artifacts", n: stats.artifacts },
    { href: "/dashboard/favorites", label: "Favorites", n: stats.favorites },
    { href: "/dashboard/collections", label: "Collections", n: stats.folders },
  ];

  return (
    <div className="max-w-md w-full">
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-8">Manage</h1>

      {error ? (
        <p className="mb-6 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="p-5 flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium shrink-0"
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{displayName}</div>
            {user?.email ? (
              <div className="text-sm text-gray-500 truncate">{user.email}</div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 inline-flex items-center gap-2 py-1"
          >
            <LogOut size={16} strokeWidth={2} className="text-gray-400" />
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-10 text-sm text-gray-500 leading-relaxed">
        {loading ? (
          <span>Loading…</span>
        ) : (
          <>
            {links.map(({ href, label, n }, i) => (
              <span key={href}>
                {i > 0 ? <span className="text-gray-300 mx-2">·</span> : null}
                <Link href={href} className="text-gray-700 hover:text-gray-900 underline-offset-2 hover:underline">
                  {label}
                </Link>
                <span className="text-gray-400 tabular-nums"> {n}</span>
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
