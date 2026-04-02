"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, X, Bookmark, Copy, Folder } from "lucide-react";

function BookmarkInstallModal({
  open,
  onClose,
  onInstalled,
  bookmarkletHref,
  onCopy,
  copied,
}) {
  const dragLinkRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (dragLinkRef.current && bookmarkletHref?.startsWith("javascript:")) {
      // Set via DOM to avoid React's javascript: URL sanitization.
      dragLinkRef.current.setAttribute("href", bookmarkletHref);
    }
  }, [bookmarkletHref, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-[560px] rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="mx-auto w-10 h-10 rounded-xl bg-memora-light text-memora-primary flex items-center justify-center mb-3">
          <Bookmark size={18} />
        </div>
        <h3 className="text-2xl font-extrabold text-center text-gray-900">Install bookmark</h3>
        <p className="text-center text-sm text-gray-600 mt-2 max-w-[460px] mx-auto">
          Stay signed in to Memora, add Save to Memora to your browser bar, then use it on any site.
          Saved content appears in Sources with original URL.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            ref={dragLinkRef}
            draggable
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-900 transition-colors"
          >
            <Bookmark size={15} />
            Save to Memora
          </a>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Copy size={15} />
            {copied ? "Copied bookmark URL" : "Copy bookmark URL"}
          </button>
        </div>

        <p className="text-[12px] text-gray-500 text-center mt-3">
          If drag does not work in Safari or Firefox, copy bookmark URL and paste while creating bookmark.
        </p>

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm font-bold text-gray-800 mb-2">Flow</div>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>You are signed in to Memora in this tab.</li>
            <li>Drag Save to Memora to bookmarks bar.</li>
            <li>Open ChatGPT/Claude/Gemini/Perplexity/X/Reddit/YouTube.</li>
            <li>Select content, click bookmark, source is saved in Sources.</li>
          </ol>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onInstalled}
            className="px-5 py-2.5 rounded-lg bg-memora-primary text-white text-sm font-bold hover:bg-memora-dark transition-colors"
          >
            I&apos;ve Installed It
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [copied, setCopied] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.localStorage.getItem("memora_bookmark_installed");
  });
  const [sources, setSources] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const bookmarkletHref = useMemo(() => {
    if (typeof window === "undefined") return "#";
    const origin = window.location.origin;
    const js = `(function(){try{var s='';try{s=window.getSelection?String(window.getSelection()):'';}catch(_e){}if(!s){var a=document.activeElement;var t=(a&&a.tagName)||'';if((t==='TEXTAREA'||t==='INPUT')&&typeof a.selectionStart==='number'&&typeof a.selectionEnd==='number'){s=String(a.value||'').slice(a.selectionStart,a.selectionEnd);}}var p={title:document.title||'Untitled source',source_url:location.href,selected_text:(s||'').slice(0,20000),content:(s||'').slice(0,20000)};var u='${origin}/bookmarklet/save';var w=window.open('about:blank','_blank','width=460,height=560');if(w){try{w.name=JSON.stringify(p);}catch(_e2){}try{w.location.href=u;}catch(_e3){}}else{var q=encodeURIComponent(JSON.stringify(p));window.location.href=u+'?p='+q;}}catch(e){console.error(e);}})();`;
    return `javascript:${js}`;
  }, []);

  async function copyBookmarklet() {
    await navigator.clipboard.writeText(bookmarkletHref);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function completeBookmarkInstall() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("memora_bookmark_installed", "1");
    }
    setShowInstallModal(false);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [sRes, fRes] = await Promise.all([
          fetch("/api/sources", { credentials: "include" }),
          fetch("/api/folders", { credentials: "include" }),
        ]);
        const sPayload = await sRes.json();
        const fPayload = await fRes.json();
        if (!sRes.ok) throw new Error(sPayload.error || "Failed to load sources");
        if (!fRes.ok) throw new Error(fPayload.error || "Failed to load folders");
        setSources(sPayload.data || []);
        setFolders(fPayload.data || []);
      } catch (e) {
        setError(e.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const recent = sources.slice(0, 6);

  return (
    <div className="max-w-[1240px]">
      <BookmarkInstallModal
        open={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstalled={completeBookmarkInstall}
        bookmarkletHref={bookmarkletHref}
        onCopy={copyBookmarklet}
        copied={copied}
      />

      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Dashboard</span>
      </div>
      <h1 className="text-[36px] font-bold text-gray-900 tracking-tight mb-8">Overview</h1>

      {error ? <div className="mb-6 text-sm font-semibold text-red-500">{error}</div> : null}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sources</div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900">{loading ? "…" : sources.length}</div>
          <div className="mt-3">
            <Link href="/dashboard/sources" className="text-sm font-semibold text-memora-primary hover:underline">
              View sources →
            </Link>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Folders</div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900">{loading ? "…" : folders.length}</div>
          <div className="mt-3 text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Folder size={16} className="text-gray-400" />
            Organize your sources
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quick actions</div>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/dashboard/sources"
              className="inline-flex items-center justify-between px-4 py-2.5 rounded-lg bg-memora-dark text-white text-sm font-bold hover:bg-memora-primary transition-colors"
            >
              Go to Sources <ExternalLink size={16} />
            </Link>
            <Link
              href="/dashboard/import"
              className="inline-flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-800 hover:bg-gray-50"
            >
              Bulk Import <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent sources</div>
            <div className="text-sm font-semibold text-gray-700 mt-1">Your latest saved items</div>
          </div>
          <Link href="/dashboard/sources" className="text-sm font-bold text-gray-700 hover:text-gray-900">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-sm font-medium text-gray-500">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="p-6 text-sm font-medium text-gray-500">No sources yet. Use the bookmark to save from any site.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map((s) => (
              <div key={s.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/dashboard/sources/${s.id}`} className="block font-bold text-gray-900 truncate hover:text-memora-primary">
                    {s.title}
                  </Link>
                  <div className="text-xs text-gray-500 mt-1 truncate">{s.source_url}</div>
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase shrink-0">{s.platform}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
