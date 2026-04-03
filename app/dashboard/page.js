"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  X,
  Bookmark,
  Copy,
  Star,
  Type,
  List,
  Clock,
  FileText,
  Plus,
  Loader2,
  Link2,
  Download,
  Trash2,
} from "lucide-react";
import { notebookSourcesToPdfBlob } from "@/lib/notebook-sources-pdf";

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

function formatLastEdited(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function sourcesCountPhrase(n) {
  const c = Number(n) || 0;
  return c === 1 ? "1 source" : `${c} sources`;
}

function downloadSourcesExport(notebookTitle, items) {
  const safe =
    String(notebookTitle || "notebook")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "notebook";
  const blob = notebookSourcesToPdfBlob({
    notebookTitle,
    items,
    exportedAt: new Date().toISOString(),
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `memora-${safe}-sources.pdf`;
  a.click();
  URL.revokeObjectURL(a.href);
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
  const [busyFolderId, setBusyFolderId] = useState(null);
  const [busyAllFolders, setBusyAllFolders] = useState(false);

  const bookmarkletHref = useMemo(() => {
    if (typeof window === "undefined") return "#";
    const origin = window.location.origin;
    const js = [
      "(function(){try{",
      "var o='",
      origin.replace(/\\/g, "\\\\").replace(/'/g, "\\'"),
      "';",
      "var s='';try{s=window.getSelection?String(window.getSelection()):'';}catch(_e){}",
      "if(!s){var a=document.activeElement;var t=(a&&a.tagName)||'';",
      "if((t==='TEXTAREA'||t==='INPUT')&&typeof a.selectionStart==='number'&&typeof a.selectionEnd==='number'){",
      "s=String(a.value||'').slice(a.selectionStart,a.selectionEnd);}}",
      "var p={title:document.title||'Untitled source',source_url:location.href,selected_text:(s||'').slice(0,20000),content:(s||'').slice(0,20000)};",
      "var u=o+'/bookmarklet/save';",
      "var pw=340,ph=168;",
      "var left=Math.max(8,(window.screen.availWidth||1200)-pw-16);",
      "var topPos=Math.min(80,Math.max(16,window.screen.availTop||0)+16);",
      "var feat='popup=yes,width='+pw+',height='+ph+',left='+left+',top='+topPos;",
      "var win=window.open('about:blank','_blank',feat);",
      "if(win){try{win.name=JSON.stringify(p);}catch(_e2){}try{win.location.href=u;}catch(_e3){}}",
      "else{var q=encodeURIComponent(JSON.stringify(p));window.location.href=u+'?p='+q;}",
      "}catch(e){console.error(e);}})();",
    ].join("");
    return `javascript:${js}`;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sRes, fRes] = await Promise.all([
        fetch("/api/sources", { credentials: "include", cache: "no-store" }),
        fetch("/api/folders", { credentials: "include", cache: "no-store" }),
      ]);
      const sPayload = await sRes.json();
      const fPayload = await fRes.json();
      if (!sRes.ok) throw new Error(sPayload.error || "Failed to load sources");
      if (!fRes.ok) throw new Error(fPayload.error || "Failed to load notebooks");
      setSources(sPayload.data || []);
      setFolders(fPayload.data || []);
    } catch (e) {
      setError(e.message || "Failed to load notebooks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteFolder(folder) {
    const ok = window.confirm(
      `Delete "${folder.name}"? Sources in this notebook will remain, but become unassigned.`
    );
    if (!ok) return;

    setBusyFolderId(folder.id);
    setError("");
    try {
      const res = await fetch(`/api/folders/${folder.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Delete failed");
      await load();
    } catch (e) {
      setError(e.message || "Could not delete notebook");
    } finally {
      setBusyFolderId(null);
    }
  }

  async function deleteAllFolders() {
    const ok = window.confirm(
      `Delete all notebooks? Sources will remain but become unassigned. This cannot be undone.`
    );
    if (!ok) return;

    setBusyAllFolders(true);
    setError("");
    try {
      const res = await fetch("/api/folders/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mode: "all" }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Delete all failed");
      await load();
    } catch (e) {
      setError(e.message || "Could not delete all notebooks");
    } finally {
      setBusyAllFolders(false);
    }
  }

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

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => {
      const fa = Boolean(a.is_favorite);
      const fb = Boolean(b.is_favorite);
      if (fa !== fb) return fa ? -1 : 1;
      return String(a.name).localeCompare(String(b.name));
    });
  }, [folders]);

  async function toggleFolderFavorite(folder) {
    setBusyFolderId(folder.id);
    setError("");
    try {
      const next = !Boolean(folder.is_favorite);
      const res = await fetch(`/api/folders/${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_favorite: next }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Update failed");
      setFolders((prev) => prev.map((f) => (f.id === folder.id ? payload.data : f)));
    } catch (e) {
      setError(e.message || "Could not update favorite");
    } finally {
      setBusyFolderId(null);
    }
  }

  async function editFolderTags(folder) {
    const current = Array.isArray(folder.tags) ? folder.tags.join(", ") : "";
    const raw = window.prompt("Tags (comma-separated)", current);
    if (raw === null) return;
    setBusyFolderId(folder.id);
    setError("");
    try {
      const res = await fetch(`/api/folders/${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tags: raw }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Update failed");
      setFolders((prev) => prev.map((f) => (f.id === folder.id ? payload.data : f)));
    } catch (e) {
      setError(e.message || "Could not update tags");
    } finally {
      setBusyFolderId(null);
    }
  }

  async function addNotebook() {
    const name = window.prompt("Notebook name");
    if (!name?.trim()) return;
    setError("");
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Could not create notebook");
      setFolders((prev) => [...prev, payload.data].sort((a, b) => String(a.name).localeCompare(String(b.name))));
    } catch (e) {
      setError(e.message || "Could not create notebook");
    }
  }

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
        <span>Notebooks</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">All Notebooks</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <h1 className="text-[36px] font-bold text-gray-900 tracking-tight">All Notebooks</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInstallModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Bookmark size={15} className="text-gray-500" />
            Bookmark
          </button>
          <button
            type="button"
            onClick={addNotebook}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-bold hover:bg-black shadow-sm"
          >
            <Plus size={16} />
            New notebook
          </button>
          <button
            type="button"
            disabled={busyAllFolders || loading || sortedFolders.length === 0}
            onClick={deleteAllFolders}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-[13px] font-bold hover:bg-red-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete all notebooks (sources remain but become unassigned)"
          >
            <Trash2 size={16} />
            {busyAllFolders ? "Deleting…" : "Delete all"}
          </button>
          <Link
            href="/dashboard/sources"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold text-memora-primary hover:underline"
          >
            Sources <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {error ? <div className="mb-4 text-sm font-semibold text-red-600">{error}</div> : null}

      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-gray-500 text-sm font-medium">
            <Loader2 size={20} className="animate-spin" />
            Loading notebooks…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/95">
                  <th
                    scope="col"
                    className="w-11 px-2 py-3 text-center border-r border-gray-100"
                    title="Star a notebook to add it to favorites"
                  >
                    <Star size={15} className="inline text-gray-400" strokeWidth={2} />
                    <span className="sr-only">Favorite</span>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-gray-600 border-r border-gray-100"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Type size={15} className="text-gray-400 shrink-0" strokeWidth={2} />
                      Name
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-gray-600 border-r border-gray-100 min-w-[240px]"
                  >
                    <span className="font-semibold text-gray-600">
                      <span className="text-gray-400">#</span> Sources
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-gray-600 border-r border-gray-100 w-[220px]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <List size={15} className="text-gray-400 shrink-0" strokeWidth={2} />
                      Tags
                    </span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap w-[200px]">
                    <span className="inline-flex items-center gap-2">
                      <Clock size={15} className="text-gray-400 shrink-0" strokeWidth={2} />
                      Last edited
                    </span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap w-[140px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedFolders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500 font-medium">
                      No notebooks yet. Create one with <span className="font-bold text-gray-700">New notebook</span> or
                      assign sources to a folder in Sources.
                    </td>
                  </tr>
                ) : (
                  sortedFolders.map((folder) => {
                    const busy = busyFolderId === folder.id;
                    const tagList = Array.isArray(folder.tags) ? folder.tags : [];
                    const fav = Boolean(folder.is_favorite);
                    const inFolder = sources.filter((s) => s.folder_id === folder.id);
                    const folderCount = inFolder.length;
                    return (
                      <tr key={folder.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                        <td className="px-2 py-3.5 text-center border-r border-gray-100 align-middle">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => toggleFolderFavorite(folder)}
                            className="p-1.5 rounded-md text-gray-300 hover:text-amber-500 hover:bg-amber-50 disabled:opacity-40"
                            title={fav ? "Remove notebook from favorites" : "Add notebook to favorites"}
                            aria-label={fav ? "Remove notebook from favorites" : "Add notebook to favorites"}
                            aria-pressed={fav}
                          >
                            <Star
                              size={18}
                              className={fav ? "text-amber-500 fill-amber-400" : ""}
                              strokeWidth={2}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3.5 border-r border-gray-100 align-middle min-w-0">
                          <Link
                            href={`/dashboard/collections?folder=${folder.id}`}
                            className="inline-flex items-center gap-2 font-semibold text-gray-900 hover:text-memora-primary min-w-0 max-w-full"
                          >
                            <FileText size={16} className="text-gray-400 shrink-0" strokeWidth={2} />
                            <span className="truncate">{folder.name}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 border-r border-gray-100 align-middle">
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <Link2 size={15} className="text-memora-primary" strokeWidth={2} aria-hidden />
                              </span>
                              <span className="text-[13px] font-medium text-gray-600 truncate">
                                {sourcesCountPhrase(folderCount)}{" "}
                                <span className="text-gray-400">•</span> Source
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => downloadSourcesExport(folder.name, inFolder)}
                              className="shrink-0 p-2 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
                              title="Download sources in this notebook (PDF)"
                              aria-label={`Download ${folderCount} sources as PDF`}
                            >
                              <Download size={16} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 border-r border-gray-100 align-middle">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => editFolderTags(folder)}
                            className="text-left w-full disabled:opacity-40 group/tags"
                          >
                            {tagList.length === 0 ? (
                              <span className="text-gray-400 font-medium group-hover/tags:text-gray-600">
                                Empty
                              </span>
                            ) : (
                              <span className="flex flex-wrap gap-1">
                                {tagList.map((t) => (
                                  <span
                                    key={t}
                                    className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[12px] font-semibold"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 font-medium align-middle whitespace-nowrap border-r border-gray-100">
                          {formatLastEdited(folder.updated_at)}
                        </td>
                        <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => deleteFolder(folder)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            title="Delete this notebook"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
