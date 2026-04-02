"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GitMerge, Folder, Search, Loader2 } from "lucide-react";

export default function MergeNotebooksPage() {
  const [folders, setFolders] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [targetId, setTargetId] = useState("");
  const [mergeIds, setMergeIds] = useState(() => new Set());
  const [merging, setMerging] = useState(false);

  const reload = useCallback(async () => {
    const [fRes, sRes] = await Promise.all([
      fetch("/api/folders", { credentials: "include", cache: "no-store" }),
      fetch("/api/sources", { credentials: "include", cache: "no-store" }),
    ]);
    const fPayload = await fRes.json();
    const sPayload = await sRes.json();
    if (!fRes.ok) throw new Error(fPayload.error || "Failed to load folders");
    if (!sRes.ok) throw new Error(sPayload.error || "Failed to load sources");
    setFolders(fPayload.data || []);
    setSources(sPayload.data || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        await reload();
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const countByFolder = useMemo(() => {
    const m = new Map();
    for (const s of sources) {
      if (!s.folder_id) continue;
      m.set(s.folder_id, (m.get(s.folder_id) || 0) + 1);
    }
    return m;
  }, [sources]);

  const filteredFolders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return folders;
    return folders.filter((f) => String(f.name || "").toLowerCase().includes(q));
  }, [folders, query]);

  useEffect(() => {
    if (folders.length && !targetId) {
      setTargetId(folders[0].id);
    }
  }, [folders, targetId]);

  function toggleMerge(id) {
    if (id === targetId) return;
    setMergeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runMerge() {
    const ids = [...mergeIds].filter((id) => id !== targetId);
    if (!targetId || ids.length === 0) {
      setStatus("Choose a folder to keep and at least one other folder to merge.");
      return;
    }
    const totalSources = ids.reduce((acc, id) => acc + (countByFolder.get(id) || 0), 0);
    const ok = window.confirm(
      `Merge ${ids.length} folder${ids.length === 1 ? "" : "s"} into the selected collection? ` +
        `About ${totalSources} source${totalSources === 1 ? "" : "s"} will move. ` +
        `The merged folders will be removed (sources stay in the kept folder).`
    );
    if (!ok) return;

    setMerging(true);
    setStatus("");
    try {
      const res = await fetch("/api/folders/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ target_folder_id: targetId, source_folder_ids: ids }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Merge failed");

      setStatus(
        `Moved ${payload.moved} source${payload.moved === 1 ? "" : "s"}; removed ${payload.removedFolders} empty folder${payload.removedFolders === 1 ? "" : "s"}.`
      );
      setMergeIds(new Set());
      await reload();
    } catch (e) {
      setStatus(e.message || "Merge failed");
    } finally {
      setMerging(false);
    }
  }

  const targetFolder = folders.find((f) => f.id === targetId);

  return (
    <div className="max-w-[720px] w-full">
      <div className="text-[13px] text-gray-500 mb-2 flex items-center gap-1">
        <span>Organize</span>
        <span className="text-gray-300">›</span>
        <span className="text-gray-900 font-medium">Merge notebooks</span>
      </div>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] flex items-center justify-center text-memora-primary shrink-0">
          <GitMerge size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900 tracking-tight">
            Merge notebooks
          </h1>
          <p className="mt-2 text-[15px] text-gray-600 font-medium leading-relaxed">
            In Memora, notebooks are{" "}
            <Link href="/dashboard/collections" className="text-memora-primary font-semibold hover:underline">
              collections
            </Link>
            . Pick one collection to <strong className="text-gray-800">keep</strong>, select others to fold into
            it—all sources move there, then those folders are removed. Each saved URL is unique per account, so
            nothing is duplicated.
          </p>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}
      {status ? (
        <p
          className={`mb-4 text-sm font-semibold ${
            status.includes("failed") || status.includes("Choose") ? "text-amber-800" : "text-memora-primary"
          }`}
        >
          {status}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-12">
          <Loader2 size={18} className="animate-spin" />
          Loading folders…
        </div>
      ) : folders.length < 2 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center">
          <Folder className="mx-auto text-gray-300 mb-3" size={40} strokeWidth={1.5} />
          <p className="text-gray-700 font-semibold mb-1">Need at least two collections</p>
          <p className="text-sm text-gray-500 mb-4">
            Create folders from{" "}
            <Link href="/dashboard/sources" className="text-memora-primary font-bold hover:underline">
              Sources
            </Link>{" "}
            first, then return here to merge.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6 mb-8">
            <label className="block">
              <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">
                Keep this collection
              </span>
              <select
                value={targetId}
                onChange={(e) => {
                  const next = e.target.value;
                  setTargetId(next);
                  setMergeIds((prev) => {
                    const s = new Set(prev);
                    s.delete(next);
                    return s;
                  });
                }}
                className="w-full max-w-md px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-900 bg-white focus:outline-none focus:border-memora-primary"
              >
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({countByFolder.get(f.id) || 0} sources)
                  </option>
                ))}
              </select>
            </label>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Merge into it
                </span>
                <div className="relative flex-1 max-w-sm">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter by name…"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-[13px] font-medium focus:outline-none focus:border-memora-primary"
                  />
                </div>
              </div>
              <ul className="rounded-2xl border border-gray-200 divide-y divide-gray-100 bg-white overflow-hidden">
                {filteredFolders
                  .filter((f) => f.id !== targetId)
                  .map((f) => {
                    const n = countByFolder.get(f.id) || 0;
                    const checked = mergeIds.has(f.id);
                    return (
                      <li key={f.id}>
                        <label className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50/80">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMerge(f.id)}
                            className="rounded border-gray-300 text-memora-primary focus:ring-memora-primary"
                          />
                          <Folder size={18} className="text-gray-400 shrink-0" />
                          <span className="flex-1 font-semibold text-gray-900 truncate">{f.name}</span>
                          <span className="text-[13px] font-medium text-gray-400 tabular-nums">
                            {n} source{n === 1 ? "" : "s"}
                          </span>
                        </label>
                      </li>
                    );
                  })}
              </ul>
              {filteredFolders.filter((f) => f.id !== targetId).length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">No other folders match your filter.</p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            disabled={merging || mergeIds.size === 0}
            onClick={runMerge}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-memora-primary text-white text-[14px] font-extrabold hover:bg-memora-dark disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {merging ? <Loader2 size={18} className="animate-spin" /> : <GitMerge size={18} />}
            {merging ? "Merging…" : "Merge collections"}
          </button>

          {targetFolder && mergeIds.size > 0 ? (
            <p className="mt-4 text-[13px] text-gray-500 font-medium">
              {mergeIds.size} folder{mergeIds.size === 1 ? "" : "s"} will be merged into{" "}
              <span className="text-gray-800 font-semibold">{targetFolder.name}</span>.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
