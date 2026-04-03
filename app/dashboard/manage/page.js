"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  Book,
  FileText,
  Layers,
  Star,
  Folder,
  Download,
  GitMerge,
  Columns,
  MessageSquare,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ManageSpacePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    sources: 0,
    artifacts: 0,
    favoriteSources: 0,
    favoriteNotebooks: 0,
    folders: 0,
    prompts: 0,
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
        const [sourcesRes, artifactsRes, favoritesRes, foldersRes, promptsRes] = await Promise.all([
          fetch("/api/sources", { credentials: "include", cache: "no-store" }),
          fetch("/api/sources?source_type=artifact", { credentials: "include", cache: "no-store" }),
          fetch("/api/sources?is_favorite=true", { credentials: "include", cache: "no-store" }),
          fetch("/api/folders", { credentials: "include", cache: "no-store" }),
          fetch("/api/prompts", { credentials: "include", cache: "no-store" }),
        ]);

        const [sourcesP, artifactsP, favoritesP, foldersP, promptsP] = await Promise.all([
          sourcesRes.json().catch(() => ({})),
          artifactsRes.json().catch(() => ({})),
          favoritesRes.json().catch(() => ({})),
          foldersRes.json().catch(() => ({})),
          promptsRes.json().catch(() => ({})),
        ]);

        if (!sourcesRes.ok) throw new Error(sourcesP.error || "Failed to load sources");
        if (!artifactsRes.ok) throw new Error(artifactsP.error || "Failed to load artifacts");
        if (!favoritesRes.ok) throw new Error(favoritesP.error || "Failed to load favorites");
        if (!foldersRes.ok) throw new Error(foldersP.error || "Failed to load folders");
        if (!promptsRes.ok) throw new Error(promptsP.error || "Failed to load prompts");

        if (cancelled) return;

        const folders = Array.isArray(foldersP.data) ? foldersP.data : [];
        const favoriteNotebooks = folders.filter((f) => f.is_favorite === true).length;

        setStats({
          sources: Array.isArray(sourcesP.data) ? sourcesP.data.length : 0,
          artifacts: Array.isArray(artifactsP.data) ? artifactsP.data.length : 0,
          favoriteSources: Array.isArray(favoritesP.data) ? favoritesP.data.length : 0,
          favoriteNotebooks,
          folders: folders.length,
          prompts: Array.isArray(promptsP.data) ? promptsP.data.length : 0,
        });
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not load workspace");
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

  const starredTotal = stats.favoriteSources + stats.favoriteNotebooks;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const overviewCards = [
    {
      href: "/dashboard/sources",
      label: "Sources",
      count: stats.sources,
      icon: FileText,
      hint: "All saved links and clips",
    },
    {
      href: "/dashboard",
      label: "Notebooks",
      count: stats.folders,
      icon: Book,
      hint: "Collections on All Notebooks",
    },
    {
      href: "/dashboard/artifacts",
      label: "Artifacts",
      count: stats.artifacts,
      icon: Layers,
      hint: "Files & generated items",
    },
    {
      href: "/dashboard/favorites",
      label: "Starred",
      count: starredTotal,
      icon: Star,
      hint: "Favorite sources & notebooks",
    },
  ];

  const toolLinks = [
    {
      href: "/dashboard/import",
      title: "Bulk Import",
      description: "Paste or upload many URLs at once into a notebook.",
      icon: Download,
    },
    {
      href: "/dashboard/merge",
      title: "Merge notebooks",
      description: "Combine two collections and tidy duplicates.",
      icon: GitMerge,
    },
    {
      href: "/dashboard/compare",
      title: "Compare",
      description: "Review sources side by side.",
      icon: Columns,
    },
    {
      href: "/dashboard/prompts",
      title: "Prompts library",
      description: `${stats.prompts} saved template${stats.prompts === 1 ? "" : "s"} — edit reusable prompts.`,
      icon: MessageSquare,
    },
    {
      href: "/dashboard/collections",
      title: "Collections",
      description: "Open any folder and manage what’s inside.",
      icon: Folder,
    },
  ];

  return (
    <div className="max-w-[1000px]">
      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Manage</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Manage Space</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[32px] md:text-[36px] font-bold text-gray-900 tracking-tight">Manage Space</h1>
          <p className="text-sm text-gray-600 font-medium mt-2 max-w-xl">
            Your account, a snapshot of this workspace, and shortcuts to import, merge, and organize Memora.
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Settings size={18} className="shrink-0" strokeWidth={2} />
          <span className="text-[12px] font-semibold uppercase tracking-wider">Workspace</span>
        </div>
      </div>

      {error ? (
        <p className="mb-6 text-sm font-semibold text-red-600">{error}</p>
      ) : null}

      <section className="mb-10 mt-8">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Account</h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
            {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.user_metadata.avatar_url ?? user.user_metadata.picture}
                alt=""
                className="w-16 h-16 rounded-full object-cover border border-gray-100 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full bg-memora-light text-memora-primary flex items-center justify-center text-xl font-bold shrink-0 border border-gray-100"
                aria-hidden
              >
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-gray-900 truncate">{displayName}</div>
              {user?.email ? <div className="text-sm text-gray-500 font-medium mt-0.5 truncate">{user.email}</div> : null}
              <p className="text-[13px] text-gray-400 font-medium mt-2">
                Signed in with Supabase Auth. Sign out ends this session on this device.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 shrink-0"
            >
              <LogOut size={18} strokeWidth={2} className="text-gray-500" />
              Sign out
            </button>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Workspace overview</h2>
        {loading ? (
          <div className="flex items-center gap-2 py-12 text-gray-500 text-sm font-medium justify-center rounded-xl border border-gray-100 bg-gray-50/50">
            <Loader2 size={20} className="animate-spin" />
            Loading counts…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {overviewCards.map(({ href, label, count, icon: Icon, hint }) => (
              <Link
                key={href + label}
                href={href}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-memora-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center group-hover:bg-memora-light group-hover:text-memora-primary transition-colors">
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <span className="text-2xl font-extrabold text-gray-900 tabular-nums">{count}</span>
                </div>
                <div className="mt-3 font-bold text-gray-900">{label}</div>
                <p className="text-[13px] text-gray-500 font-medium mt-1">{hint}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tools &amp; data</h2>
        <p className="text-sm text-gray-600 font-medium mb-4 max-w-2xl">
          Manage Space is the hub for heavy-lifting: bring data in, merge notebooks, and jump to where you edit
          sources and prompts.
        </p>
        <ul className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
          {toolLinks.map(({ href, title, description, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50/80 transition-colors group"
              >
                <span className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center shrink-0 group-hover:bg-memora-light group-hover:text-memora-primary transition-colors">
                  <Icon size={20} strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900">{title}</div>
                  <p className="text-[13px] text-gray-500 font-medium mt-0.5">{description}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-memora-primary shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
