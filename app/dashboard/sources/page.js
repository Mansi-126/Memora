"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Download, FolderInput, Trash2, ChevronDown, FolderPlus, 
  Search, Filter, RotateCw, Square, Star, Folder, Tag, Link2, Copy, X, Bookmark
} from "lucide-react";

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

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.localStorage.getItem("memora_bookmark_installed");
  });
  const quickSetupLinkRef = useRef(null);

  async function loadSources() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/sources", { credentials: "include" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to load sources");
      setSources(payload.data || []);
    } catch (err) {
      setError(err.message || "Unable to fetch sources");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSources();
  }, []);

  const bookmarkletHref = useMemo(() => {
    if (typeof window === "undefined") return "#";
    const origin = window.location.origin;
    const js = `(function(){try{var s='';try{s=window.getSelection?String(window.getSelection()):'';}catch(_e){}if(!s){var a=document.activeElement;var t=(a&&a.tagName)||'';if((t==='TEXTAREA'||t==='INPUT')&&typeof a.selectionStart==='number'&&typeof a.selectionEnd==='number'){s=String(a.value||'').slice(a.selectionStart,a.selectionEnd);}}var p={title:document.title||'Untitled source',source_url:location.href,selected_text:(s||'').slice(0,20000),content:(s||'').slice(0,20000)};var u='${origin}/bookmarklet/save';var w=window.open('about:blank','_blank','width=460,height=560');if(w){try{w.name=JSON.stringify(p);}catch(_e2){}try{w.location.href=u;}catch(_e3){}}else{var q=encodeURIComponent(JSON.stringify(p));window.location.href=u+'?p='+q;}}catch(e){console.error(e);}})();`;
    return `javascript:${js}`;
  }, []);

  useEffect(() => {
    if (quickSetupLinkRef.current && bookmarkletHref?.startsWith("javascript:")) {
      quickSetupLinkRef.current.setAttribute("href", bookmarkletHref);
    }
  }, [bookmarkletHref]);

  const filteredSources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sources;
    return sources.filter((item) =>
      [item.title, item.source_url, item.platform]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q))
    );
  }, [query, sources]);

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

  function formatDate(v) {
    try {
      return new Date(v).toLocaleString();
    } catch {
      return "-";
    }
  }

  return (
    <div className="w-full max-w-full">
      <BookmarkInstallModal
        open={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstalled={completeBookmarkInstall}
        bookmarkletHref={bookmarkletHref}
        onCopy={copyBookmarklet}
        copied={copied}
      />

      {/* Breadcrumbs */}
      <div className="text-[13px] text-gray-500 mb-2 flex items-center gap-1">
        <span>Notebooks</span>
        <span className="text-gray-300">›</span>
        <span className="text-gray-900 font-medium">Sources</span>
      </div>
      
      {/* Page Title */}
      <h1 className="text-[32px] md:text-[36px] font-bold text-gray-900 tracking-tight mb-4">All Sources</h1>
      
      {/* Badges / Filters */}
      <div className="flex items-center gap-3 mb-6">
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
          <ChevronLeft size={16} className="text-gray-400" />
          <span>All Sources / <span className="text-gray-900 font-bold">All</span></span>
        </button>
        <div className="px-3 py-1.5 rounded-full bg-green-100/50 text-memora-primary border border-green-100 text-xs font-bold tracking-wide uppercase">
          {sources.length} TOTAL
        </div>
      </div>

      <div className="mb-6 border border-memora-border rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Quick Bookmark Setup</h3>
            <p className="text-sm text-gray-600">
              Drag this button to your bookmarks bar. Then on ChatGPT, Claude, Gemini, Perplexity, X, Reddit, or YouTube:
              select content and click the bookmark to save with original URL.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              ref={quickSetupLinkRef}
              draggable
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-memora-dark text-white text-sm font-semibold hover:bg-memora-primary transition-colors"
            >
              <Link2 size={15} />
              Save to Memora
            </a>
            <button
              type="button"
              onClick={copyBookmarklet}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Copy size={15} />
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-sm font-medium text-gray-500 mb-4">Showing every folder</p>
      
      <hr className="border-gray-200 mb-5" />
      
      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
        {/* Left Actions */}
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-300 cursor-not-allowed">
            <Download size={16} strokeWidth={2.5} /> Download
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            <FolderInput size={16} strokeWidth={2.5} /> Move to Folder
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold text-[#f87171] hover:text-red-500 transition-colors">
            <Trash2 size={16} strokeWidth={2.5} /> Delete
          </button>
        </div>
        
        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-3 pb-1">
          <button className="flex items-center justify-between gap-4 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-[130px] transition-colors">
            All Folders <ChevronDown size={16} className="text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
            <FolderPlus size={16} className="text-gray-400" /> New Folder
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search sources..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-memora-primary/20 focus:border-memora-primary w-[220px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
            <Filter size={16} className="text-gray-800" /> Filter
          </button>
          <button
            type="button"
            onClick={loadSources}
            className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>
      
      {/* Table Area */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {/* Table Header */}
        <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 bg-white text-xs font-semibold text-gray-400">
          <div className="flex">
            <div className="w-[50px] p-4 flex items-center justify-center border-r border-gray-200">
              <Square size={16} className="text-gray-200 hover:text-gray-400 cursor-pointer transition-colors" />
            </div>
            <div className="w-[50px] p-4 flex items-center justify-center border-r border-gray-200">
              <Star size={16} className="text-gray-300" />
            </div>
          </div>
          <div className="flex-[2] min-w-[200px] p-4 flex items-center gap-2 md:border-r border-gray-200 px-6">
            <span className="text-[10px] font-bold text-gray-400 tracking-tighter">AA</span> Name
          </div>
          <div className="flex-1 min-w-[150px] p-4 flex items-center gap-2 border-t md:border-t-0 md:border-r border-gray-200">
            <Folder size={14} className="text-gray-300" /> Platform
          </div>
          <div className="flex-1 min-w-[150px] p-4 flex items-center gap-2 border-t md:border-t-0 md:border-r border-gray-200">
            <Tag size={14} className="text-gray-300" /> Type
          </div>
          <div className="flex-1 min-w-[150px] p-4 flex items-center gap-2 border-t md:border-t-0">
            Last edited time
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">Loading sources...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 font-medium">{error}</div>
        ) : filteredSources.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center min-h-[460px]">
            <div className="w-[64px] h-[64px] bg-[#E8F5EE] rounded-[16px] flex items-center justify-center text-memora-dark mb-6">
              <Folder size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-2">No Sources Yet</h3>
            <p className="text-gray-500 font-medium text-[14px]">
              You haven&apos;t imported any documents, links, or media yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSources.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center text-sm">
                <div className="flex">
                  <div className="w-[50px] p-4 border-r border-gray-100 flex items-center justify-center">
                    <Square size={16} className="text-gray-300" />
                  </div>
                  <div className="w-[50px] p-4 border-r border-gray-100 flex items-center justify-center">
                    <Star size={16} className={item.is_favorite ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                  </div>
                </div>
                <div className="flex-[2] min-w-[200px] p-4 px-6 overflow-hidden">
                  <Link href={`/dashboard/sources/${item.id}`} className="font-semibold text-gray-900 block truncate hover:text-memora-primary">
                    {item.title}
                  </Link>
                  <a href={item.source_url} target="_blank" rel="noreferrer" className="text-xs text-memora-primary truncate block mt-0.5">
                    {item.source_url}
                  </a>
                </div>
                <div className="flex-1 min-w-[150px] p-4 border-t md:border-t-0 md:border-l border-gray-100 text-gray-700 truncate">
                  {item.platform || "web"}
                </div>
                <div className="flex-1 min-w-[150px] p-4 border-t md:border-t-0 md:border-l border-gray-100 text-gray-700 truncate">
                  {item.source_type || "web"}
                </div>
                <div className="flex-1 min-w-[150px] p-4 border-t md:border-t-0 md:border-l border-gray-100 text-gray-500">
                  {formatDate(item.updated_at || item.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-xs font-bold text-gray-500">
        <div className="mb-4 md:mb-0">0 of {filteredSources.length} row(s) selected.</div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <button className="flex items-center gap-1 text-gray-900 font-bold">
              10 <ChevronDown size={14} />
            </button>
          </div>
          <div>Page 1 of 1</div>
          <div className="flex items-center gap-3 text-gray-300">
            <ChevronsLeft size={16} strokeWidth={2.5} className="cursor-not-allowed" />
            <ChevronLeft size={16} strokeWidth={2.5} className="cursor-not-allowed" />
            <ChevronRight size={16} strokeWidth={2.5} className="cursor-not-allowed" />
            <ChevronsRight size={16} strokeWidth={2.5} className="cursor-not-allowed" />
          </div>
        </div>
      </div>
    </div>
  );
}
