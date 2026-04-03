"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Book, FileText, Layers, Settings, Folder, Star, GitMerge, Columns, MessageSquare, Download, Grid, LogOut, Leaf } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MEMORA_DASHBOARD_REFRESH } from "@/lib/dashboard-events";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({
    notebooks: 0,
    sources: 0,
    artifacts: 0,
    collections: 0,
    favorites: 0,
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

  const lastCountsSuccessRef = useRef(0);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    async function loadCounts(force) {
      const now = Date.now();
      if (!force && document.visibilityState === "visible" && now - lastCountsSuccessRef.current < 45_000) {
        return;
      }

      try {
        const [sourcesRes, artifactsRes, favoritesRes, foldersRes] = await Promise.all([
          fetch("/api/sources", { credentials: "include", cache: "no-store" }),
          fetch("/api/sources?source_type=artifact", { credentials: "include", cache: "no-store" }),
          fetch("/api/sources?is_favorite=true", { credentials: "include", cache: "no-store" }),
          fetch("/api/folders", { credentials: "include", cache: "no-store" }),
        ]);

        const [sourcesPayload, artifactsPayload, favoritesPayload, foldersPayload] = await Promise.all([
          sourcesRes.json().catch(() => ({ data: [] })),
          artifactsRes.json().catch(() => ({ data: [] })),
          favoritesRes.json().catch(() => ({ data: [] })),
          foldersRes.json().catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;

        const foldersCount = Array.isArray(foldersPayload.data) ? foldersPayload.data.length : 0;
        const favoriteSourcesCount = Array.isArray(favoritesPayload.data) ? favoritesPayload.data.length : 0;
        const favoriteFoldersCount = Array.isArray(foldersPayload.data)
          ? foldersPayload.data.filter((f) => f.is_favorite === true).length
          : 0;
        setCounts({
          notebooks: foldersCount,
          sources: Array.isArray(sourcesPayload.data) ? sourcesPayload.data.length : 0,
          artifacts: Array.isArray(artifactsPayload.data) ? artifactsPayload.data.length : 0,
          collections: foldersCount,
          favorites: favoriteSourcesCount + favoriteFoldersCount,
        });
        lastCountsSuccessRef.current = Date.now();
      } catch {
        if (cancelled) return;
      }
    }

    loadCounts(true);

    function onVisible() {
      if (document.visibilityState === "visible") loadCounts(false);
    }

    function onDashboardRefresh() {
      loadCounts(true);
    }

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(MEMORA_DASHBOARD_REFRESH, onDashboardRefresh);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(MEMORA_DASHBOARD_REFRESH, onDashboardRefresh);
    };
  }, [user?.id]);

  const displayName = useMemo(() => {
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.first_name ||
      user?.email ||
      "Account"
    );
  }, [user]);

  const avatarInitial = useMemo(() => {
    const s = String(displayName ?? "").trim();
    return s ? s[0].toUpperCase() : "M";
  }, [displayName]);

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* still navigate away */
    }
    router.push("/");
    router.refresh();
  }

  const viewItems = [
    { name: "Notebooks", href: "/dashboard", icon: Book, badge: counts.notebooks },
    { name: "Sources", href: "/dashboard/sources", icon: FileText, badge: counts.sources },
    { name: "Artifacts", href: "/dashboard/artifacts", icon: Layers, badge: counts.artifacts },
  ];

  const manageItems = [
    { name: "Manage Space", href: "/dashboard/manage", icon: Settings },
  ];

  const organizeItems = [
    { name: "Collections", href: "/dashboard/collections", icon: Folder, badge: counts.collections },
    { name: "Favorites", href: "/dashboard/favorites", icon: Star, badge: counts.favorites },
  ];

  const toolItems = [
    { name: "Merge Notebooks", href: "/dashboard/merge", icon: GitMerge },
    { name: "Compare", href: "/dashboard/compare", icon: Columns },
    { name: "Prompts", href: "/dashboard/prompts", icon: MessageSquare },
    { name: "Bulk Import", href: "/dashboard/import", icon: Download },
  ];

  const renderNavGroup = (title, items) => (
    <div className="mb-6">
      {title && <div className="text-[11px] font-bold text-gray-400 mb-2 px-3">{title}</div>}
      <div className="space-y-0.5">
        {items.map((item) => {
          // simple check for active state
          const isActive = pathname === item.href || (pathname === '/dashboard' && item.href === '/dashboard' && pathname.length === 10) || (pathname.startsWith(item.href) && item.href !== '/dashboard');
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${isActive ? 'bg-memora-light text-memora-dark' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <item.icon size={16} className={isActive ? "text-memora-primary" : "text-gray-400"} />
              <span className="flex-1 truncate">{item.name}</span>
              {item.badge !== undefined && <span className={isActive ? "text-memora-primary font-bold text-xs" : "text-xs font-medium text-gray-400"}>{item.badge}</span>}
            </Link>
          )
        })}
      </div>
    </div>
  );

  return (
    <aside className={`flex flex-col h-full bg-white transition-transform duration-300 w-full`}>
      
      {/* LOGO AREA */}
      <div className="h-[72px] flex items-center px-4 gap-3 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 min-w-0 flex-1 rounded-lg -ml-1 pl-1 py-1 hover:bg-gray-50 transition-colors"
          title="Back to Memora home"
        >
          <Leaf className="text-memora-primary drop-shadow-sm shrink-0" size={26} />
          <span className="font-heading font-bold text-[15px] tracking-tight text-memora-text truncate">Memora</span>
        </Link>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded p-1 shadow-sm shrink-0"
          aria-label="Menu"
        >
          <Grid size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {renderNavGroup("Views", viewItems)}
        {renderNavGroup("Organize", organizeItems)}
        {renderNavGroup("Tools", toolItems)}
        {renderNavGroup(null, manageItems)}
      </div>

      {/* BOTTOM ACCOUNT SECTION */}
      <div className="p-3 sm:p-4 shrink-0 mx-2 mb-2 border-t border-gray-100">
        <div className="flex items-center gap-2 w-full min-w-0">
          <div className="w-10 h-10 shrink-0 bg-[#34682c] rounded-full flex items-center justify-center text-white font-medium text-[20px] overflow-hidden">
            {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.user_metadata.avatar_url ?? user.user_metadata.picture}
                alt={displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              avatarInitial
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
            <span className="text-[15px] font-bold text-gray-900 leading-snug truncate" title={displayName}>
              {displayName}
            </span>
            {user?.email ? (
              <span
                className="text-[12px] font-medium text-gray-400 leading-snug mt-0.5 truncate"
                title={user.email}
              >
                {user.email}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="shrink-0 flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
      
    </aside>
  );
}
