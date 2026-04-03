"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Bookmark,
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
import { useBookmarkSetup } from "@/components/dashboard/BookmarkSetupProvider";
import { refreshDashboardSidebar } from "@/lib/dashboard-events";

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

async function downloadSourcesExport(notebookTitle, items) {
  try {
    const { notebookSourcesToPdfBlob } = await import("@/lib/notebook-sources-pdf");
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
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `memora-${safe}-sources.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
  }
}

export default function DashboardHome() {
  const { openBookmarkModal } = useBookmarkSetup();
  const [sources, setSources] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyFolderId, setBusyFolderId] = useState(null);
  const [busyAllFolders, setBusyAllFolders] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sRes, fRes] = await Promise.all([
        fetch("/api/sources", { credentials: "include", cache: "no-store" }),
        fetch("/api/folders", { credentials: "include", cache: "no-store" }),
      ]);
      const sPayload = await sRes.json().catch(() => ({}));
      const fPayload = await fRes.json().catch(() => ({}));
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
      refreshDashboardSidebar();
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
      refreshDashboardSidebar();
    } catch (e) {
      setError(e.message || "Could not delete all notebooks");
    } finally {
      setBusyAllFolders(false);
    }
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
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Update failed");
      setFolders((prev) => prev.map((f) => (f.id === folder.id ? payload.data : f)));
      refreshDashboardSidebar();
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
      const payload = await res.json().catch(() => ({}));
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
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Could not create notebook");
      setFolders((prev) => [...prev, payload.data].sort((a, b) => String(a.name).localeCompare(String(b.name))));
      refreshDashboardSidebar();
    } catch (e) {
      setError(e.message || "Could not create notebook");
    }
  }

  return (
    <div className="max-w-[1240px]">
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
            onClick={openBookmarkModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Bookmark size={15} fill="currentColor" className="text-gray-500" />
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
                              onClick={() => void downloadSourcesExport(folder.name, inFolder)}
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
