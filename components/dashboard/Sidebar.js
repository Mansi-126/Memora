"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Book, FileText, Layers, Settings, Folder, Star, Mic, GitMerge, Columns, Zap, MessageSquare, Download, File, Edit3, Grid, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

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
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const viewItems = [
    { name: "Notebooks", href: "/dashboard", icon: Book, badge: 11 },
    { name: "Sources", href: "/dashboard/sources", icon: FileText, badge: 0 },
    { name: "Artifacts", href: "/dashboard/artifacts", icon: Layers, badge: 16 },
    { name: "Manage Space", href: "/dashboard/manage", icon: Settings },
  ];

  const organizeItems = [
    { name: "Collections", href: "/dashboard/collections", icon: Folder, badge: 0 },
    { name: "Favorites", href: "/dashboard/favorites", icon: Star, badge: 0 },
    { name: "Podcasts", href: "/dashboard/podcasts", icon: Mic },
  ];

  const toolItems = [
    { name: "Merge Notebooks", href: "/dashboard/merge", icon: GitMerge },
    { name: "Compare", href: "/dashboard/compare", icon: Columns },
    { name: "Automation", href: "/dashboard/automation", icon: Zap },
    { name: "Prompts", href: "/dashboard/prompts", icon: MessageSquare },
    { name: "Bulk Import", href: "/dashboard/import", icon: Download },
    { name: "Notebook Templates", href: "/dashboard/templates/notebook", icon: File },
    { name: "Source Templates", href: "/dashboard/templates/source", icon: File },
    { name: "Note Templates", href: "/dashboard/templates/note", icon: Edit3 },
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
        <div className="w-6 h-6 bg-memora-primary rounded-md flex items-center justify-center text-white font-bold text-xs">
          K
        </div>
        <span className="font-semibold text-[15px] text-gray-900 flex-1 truncate">Memora Workspace</span>
        <button className="text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded p-1 shadow-sm">
          <Grid size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {renderNavGroup("Views", viewItems)}
        {renderNavGroup("Organize", organizeItems)}
        {renderNavGroup("Tools", toolItems)}
      </div>

      {/* BOTTOM ACCOUNT SECTION */}
      <div className="p-4 shrink-0 mx-2 mb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#34682c] rounded-full flex items-center justify-center text-white font-medium text-[20px] overflow-hidden">
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
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-gray-900 leading-tight">{displayName}</span>
              <span className="text-[13px] font-medium text-gray-400 leading-tight mt-0.5">
                {user?.email || ""}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            title="Sign out"
          >
            <LogOut size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
      
    </aside>
  );
}
