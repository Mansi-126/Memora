"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  ExternalLink,
  Trash2,
  Plus,
  Sparkles,
  Link2,
  Folder,
  Pencil,
  Copy,
} from "lucide-react";

function formatAddedAt(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ArtifactsPage() {
  const [items, setItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");

  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newFolderId, setNewFolderId] = useState("");
  const [addBusy, setAddBusy] = useState(false);

  const [busyId, setBusyId] = useState(null);

  const reloadArtifacts = useCallback(async () => {
    const res = await fetch("/api/sources?source_type=artifact", {
      credentials: "include",
      cache: "no-store",
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || "Failed to load artifacts");
    setItems(payload.data || []);
  }, []);

  const reloadFolders = useCallback(async () => {
    const res = await fetch("/api/folders", { credentials: "include" });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || "Failed to load folders");
    setFolders(payload.data || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      setError("");
      try {
        await Promise.all([reloadArtifacts(), reloadFolders()]);
      } catch (e) {
        if (!cancelled) setError(e.message || "Unable to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [reloadArtifacts, reloadFolders]);

  const folderNameById = useMemo(() => {
    const m = new Map();
    folders.forEach((f) => m.set(f.id, f.name));
    return m;
  }, [folders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) =>
      [x.title, x.source_url, x.platform, folderNameById.get(x.folder_id)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query, folderNameById]);

  async function addArtifact(e) {
    e.preventDefault();
    const url = newUrl.trim();
    if (!url) {
      setStatus("Enter a link (https://…)");
      return;
    }
    setAddBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          source_url: url,
          title: newTitle.trim() || url,
          source_type: "artifact",
          folder_id: newFolderId || null,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Could not save artifact");
      const row = Array.isArray(payload.data) ? payload.data[0] : payload.data;
      if (row) setItems((prev) => [row, ...prev]);
      else await reloadArtifacts();
      setNewUrl("");
      setNewTitle("");
      setNewFolderId("");
      setStatus("Saved to your artifacts");
    } catch (err) {
      setStatus(err.message || "Save failed");
    } finally {
      setAddBusy(false);
    }
  }

  async function deleteArtifact(item) {
    const ok = window.confirm(
      `Remove “${item.title}” from Memora? This cannot be undone.`
    );
    if (!ok) return;
    setBusyId(item.id);
    setStatus("");
    try {
      const res = await fetch("/api/sources/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: [item.id] }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Delete failed");
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setStatus("Removed");
    } catch (err) {
      setStatus(err.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  async function copyVisibleLinks() {
    const text = filtered.map((x) => x.source_url).join("\n");
    if (!text) {
      setStatus("Nothing to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setStatus(`Copied ${filtered.length} link${filtered.length === 1 ? "" : "s"}`);
    } catch {
      setStatus("Could not copy — try again");
    }
  }

  return (
    <div className="max-w-[960px] w-full">
      <div className="text-[13px] text-gray-500 mb-2 flex items-center gap-1">
        <span>Library</span>
        <span className="text-gray-300">›</span>
        <span className="text-gray-900 font-medium">Artifacts</span>
      </div>

      <div className="rounded-[28px] border border-gray-200 bg-gradient-to-br from-[#f0fdf4] via-white to-white p-8 md:p-10 mb-10 shadow-[0_2px_24px_rgba(33,197,94,0.06)]">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-memora-primary shrink-0 shadow-sm">
            <Layers size={30} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[30px] md:text-[34px] font-extrabold text-gray-900 tracking-tight mb-2">
              Artifacts
            </h1>
            <p className="text-[15px] text-gray-600 font-medium leading-relaxed max-w-[620px]">
              Keep links to things you <span className="text-gray-900 font-semibold">created or curated</span>
              —exports, shared docs, design files, published pages — separate from everyday bookmarks in{" "}
              <Link href="/dashboard/sources" className="text-memora-primary font-bold hover:underline">
                Sources
              </Link>
              . Each artifact is one URL you can open, edit, or remove anytime.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-gray-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200">
                <Sparkles size={14} className="text-memora-primary" />
                Outputs & references
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200">
                <Link2 size={14} className="text-gray-400" />
                HTTPS links only
              </span>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-6 text-sm font-semibold text-red-600">{error}</div>
      ) : null}
      {status ? (
        <div
          className={`mb-6 text-sm font-semibold ${
            status.includes("fail") || status.includes("Could not") || status.includes("Enter")
              ? "text-red-600"
              : "text-memora-primary"
          }`}
        >
          {status}
        </div>
      ) : null}

      <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 border border-gray-100">
            <Plus size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Add an artifact</h2>
            <p className="text-[13px] text-gray-500 font-medium">
              Paste a link; title is optional (we default to the URL).
            </p>
          </div>
        </div>
        <form onSubmit={addArtifact} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_minmax(0,280px)]">
            <label className="block">
              <span className="sr-only">Link</span>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://…"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium placeholder:text-gray-400 focus:outline-none focus:border-memora-primary focus:ring-1 focus:ring-memora-primary/30"
              />
            </label>
            <label className="block">
              <span className="sr-only">Title</span>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium placeholder:text-gray-400 focus:outline-none focus:border-memora-primary focus:ring-1 focus:ring-memora-primary/30"
              />
            </label>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
            <label className="block w-full sm:max-w-xs">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1.5">
                Collection (optional)
              </span>
              <select
                value={newFolderId}
                onChange={(e) => setNewFolderId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 bg-gray-50/80 outline-none focus:border-memora-primary"
              >
                <option value="">None</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={addBusy}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-memora-primary text-white text-[14px] font-extrabold hover:bg-memora-dark disabled:opacity-50 transition-colors shrink-0"
            >
              {addBusy ? "Saving…" : "Save artifact"}
            </button>
          </div>
        </form>
        {folders.length === 0 ? (
          <p className="mt-4 text-[12px] text-gray-500 font-medium">
            Create folders from{" "}
            <Link href="/dashboard/sources" className="text-memora-primary font-bold hover:underline">
              Sources
            </Link>{" "}
            to file new artifacts into a collection.
          </p>
        ) : null}
      </section>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-[13px] font-bold text-gray-500">
          {loading
            ? "Loading…"
            : query.trim()
              ? `Showing ${filtered.length} of ${items.length} artifact${items.length === 1 ? "" : "s"}`
              : `${items.length} artifact${items.length === 1 ? "" : "s"}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyVisibleLinks}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <Copy size={15} />
            Copy visible links
          </button>
          <div className="relative flex-1 min-w-[200px] sm:min-w-[260px] sm:flex-initial">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, link, or collection…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium placeholder:text-gray-400 focus:outline-none focus:border-memora-primary bg-white"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((k) => (
              <div
                key={k}
                className="h-36 rounded-2xl border border-gray-100 bg-gray-50/80 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 px-8 py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 mb-4">
              <Layers size={32} strokeWidth={1.8} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">
              {items.length === 0 ? "No artifacts yet" : "No matches"}
            </h3>
            <p className="text-sm text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
              {items.length === 0
                ? "Use the form above to save your first link, or adjust your search."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((item) => {
              const folderLabel = item.folder_id
                ? folderNameById.get(item.folder_id)
                : null;
              const busy = busyId === item.id;
              return (
                <li
                  key={item.id}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-memora-primary/25 hover:shadow-[0_8px_28px_rgba(33,197,94,0.08)] transition-all flex flex-col min-h-[160px]"
                >
                  <div className="flex-1 min-w-0 mb-4">
                    <Link
                      href={`/dashboard/sources/${item.id}`}
                      className="text-[16px] font-extrabold text-gray-900 hover:text-memora-primary leading-snug line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-[12px] font-semibold text-memora-primary truncate hover:underline"
                    >
                      {item.source_url}
                    </a>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {formatAddedAt(item.created_at) ? (
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                          {formatAddedAt(item.created_at)}
                        </span>
                      ) : null}
                      {folderLabel ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                          <Folder size={11} strokeWidth={2.5} />
                          {folderLabel}
                        </span>
                      ) : null}
                      <span className="text-[11px] font-bold text-gray-400 capitalize">
                        {item.platform || "web"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-gray-700 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink size={14} />
                      Open
                    </a>
                    <Link
                      href={`/dashboard/sources/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-gray-700 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <Pencil size={14} />
                      Details
                    </Link>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => deleteArtifact(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 disabled:opacity-50 ml-auto sm:ml-0 transition-colors"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
