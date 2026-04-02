"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Columns,
  Search,
  Loader2,
  ExternalLink,
  Star,
  FileText,
} from "lucide-react";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function clip(text, max = 1200) {
  if (!text || !String(text).trim()) return "—";
  const s = String(text).trim();
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split string into segments; odd indices (after split with capture) are query matches. */
function highlightSegments(text, rawQuery) {
  const q = rawQuery.trim();
  if (!q) return [{ text: String(text), hit: false }];
  const t = String(text);
  if (t === "—") return [{ text: t, hit: false }];
  try {
    const parts = t.split(new RegExp(`(${escapeRegExp(q)})`, "gi"));
    return parts.map((p, i) => ({ text: p, hit: i % 2 === 1 }));
  } catch {
    return [{ text: t, hit: false }];
  }
}

function textIncludesQuery(text, rawQuery) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return false;
  return String(text).toLowerCase().includes(q);
}

function HighlightedInline({ text, query, bothSides }) {
  const segs = highlightSegments(text, query);
  const markClass = bothSides
    ? "bg-lime-200/90 text-gray-900 rounded px-0.5 font-semibold"
    : "bg-amber-100 text-gray-900 rounded px-0.5";
  return (
    <>
      {segs.map((seg, i) =>
        seg.hit ? (
          <mark key={i} className={`${markClass} [print-color-adjust:exact]`}>
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

export default function ComparePage() {
  const [sources, setSources] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");

  const reload = useCallback(async () => {
    const [sRes, fRes] = await Promise.all([
      fetch("/api/sources", { credentials: "include", cache: "no-store" }),
      fetch("/api/folders", { credentials: "include", cache: "no-store" }),
    ]);
    const sPayload = await sRes.json();
    const fPayload = await fRes.json();
    if (!sRes.ok) throw new Error(sPayload.error || "Failed to load sources");
    if (!fRes.ok) throw new Error(fPayload.error || "Failed to load folders");
    setSources(sPayload.data || []);
    setFolders(fPayload.data || []);
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

  const folderNameById = useMemo(() => {
    const m = new Map();
    folders.forEach((f) => m.set(f.id, f.name));
    return m;
  }, [folders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sources;
    return sources.filter((s) => {
      const folderName = s.folder_id ? folderNameById.get(s.folder_id) : "";
      const blob = [
        s.title,
        s.source_url,
        s.platform,
        s.source_type,
        s.selected_text,
        s.content,
        folderName,
      ]
        .filter(Boolean)
        .join("\n")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [sources, query, folderNameById]);

  useEffect(() => {
    if (sources.length < 2) return;
    setLeftId((prev) =>
      prev && sources.some((s) => s.id === prev) ? prev : sources[0].id
    );
  }, [sources]);

  useEffect(() => {
    if (sources.length < 2 || !leftId) return;
    setRightId((prev) => {
      if (prev && sources.some((s) => s.id === prev) && prev !== leftId) return prev;
      const other = sources.find((s) => s.id !== leftId);
      return other ? other.id : prev;
    });
  }, [sources, leftId]);

  const left = sources.find((s) => s.id === leftId);
  const right = sources.find((s) => s.id === rightId);

  const leftOptions = useMemo(() => {
    if (left && !filtered.some((s) => s.id === left.id)) return [left, ...filtered];
    return filtered;
  }, [filtered, left]);

  const rightOptions = useMemo(() => {
    if (right && !filtered.some((s) => s.id === right.id)) return [right, ...filtered];
    return filtered;
  }, [filtered, right]);

  const rows = useMemo(() => {
    if (!left || !right) return [];
    const L = (v) => (v === undefined || v === null || v === "" ? "—" : String(v));
    return [
      { key: "title", label: "Title", a: L(left.title), b: L(right.title) },
      { key: "url", label: "URL", a: L(left.source_url), b: L(right.source_url) },
      { key: "platform", label: "Platform", a: L(left.platform), b: L(right.platform) },
      { key: "type", label: "Type", a: L(left.source_type), b: L(right.source_type) },
      {
        key: "folder",
        label: "Collection",
        a: left.folder_id ? L(folderNameById.get(left.folder_id)) : "—",
        b: right.folder_id ? L(folderNameById.get(right.folder_id)) : "—",
      },
      {
        key: "favorite",
        label: "Favorite",
        a: left.is_favorite ? "Yes" : "No",
        b: right.is_favorite ? "Yes" : "No",
      },
      {
        key: "saved",
        label: "Saved",
        a: formatDate(left.created_at),
        b: formatDate(right.created_at),
      },
      {
        key: "clip",
        label: "Clipped text",
        a: clip(left.selected_text || left.content),
        b: clip(right.selected_text || right.content),
      },
    ];
  }, [left, right, folderNameById]);

  function swapSides() {
    setLeftId(rightId);
    setRightId(leftId);
  }

  return (
    <div className="max-w-[1100px] w-full">
      <div className="text-[13px] text-gray-500 mb-2 flex items-center gap-1">
        <span>Tools</span>
        <span className="text-gray-300">›</span>
        <span className="text-gray-900 font-medium">Compare</span>
      </div>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] flex items-center justify-center text-memora-primary shrink-0">
          <Columns size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900 tracking-tight">
            Compare sources
          </h1>
          <p className="mt-2 text-[15px] text-gray-600 font-medium leading-relaxed max-w-2xl">
            Put two items from{" "}
            <Link href="/dashboard/sources" className="text-memora-primary font-semibold hover:underline">
              Sources
            </Link>{" "}
            next to each other—link, platform, type, collection, and any text you saved with the bookmark.
          </p>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-12">
          <Loader2 size={18} className="animate-spin" />
          Loading…
        </div>
      ) : sources.length < 2 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center">
          <FileText className="mx-auto text-gray-300 mb-3" size={40} strokeWidth={1.5} />
          <p className="text-gray-700 font-semibold mb-1">Save at least two sources</p>
          <p className="text-sm text-gray-500 mb-4">
            Compare needs two different entries from your library.
          </p>
          <Link
            href="/dashboard/sources"
            className="inline-flex text-sm font-bold text-memora-primary hover:underline"
          >
            Go to Sources →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 space-y-2">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">
                Left
              </label>
              <select
                value={leftId}
                onChange={(e) => {
                  const v = e.target.value;
                  setLeftId(v);
                  if (v === rightId) {
                    const other = sources.find((s) => s.id !== v);
                    if (other) setRightId(other.id);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-900 bg-white focus:outline-none focus:border-memora-primary"
              >
                {leftOptions.map((s) => (
                  <option key={s.id} value={s.id} disabled={s.id === rightId}>
                    {s.title?.slice(0, 80) || s.source_url}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end lg:items-end justify-center lg:pb-1">
              <button
                type="button"
                onClick={swapSides}
                className="text-[13px] font-bold text-memora-primary hover:underline px-2 py-2"
              >
                Swap sides
              </button>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">
                Right
              </label>
              <select
                value={rightId}
                onChange={(e) => {
                  const v = e.target.value;
                  setRightId(v);
                  if (v === leftId) {
                    const other = sources.find((s) => s.id !== v);
                    if (other) setLeftId(other.id);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-900 bg-white focus:outline-none focus:border-memora-primary"
              >
                {rightOptions.map((s) => (
                  <option key={s.id} value={s.id} disabled={s.id === leftId}>
                    {s.title?.slice(0, 80) || s.source_url}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative max-w-md mb-8">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sources & highlight matches in compare…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium focus:outline-none focus:border-memora-primary"
            />
          </div>

          {query.trim() ? (
            <p className="text-[12px] text-gray-500 font-medium mb-3">
              <span className="text-amber-800/90 font-semibold">Amber</span> = match on one side;{" "}
              <span className="text-lime-800 font-semibold">Green</span> = same search text found on both
              sides in that row.
            </p>
          ) : null}

          {left && right ? (
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
                <div className="bg-[#fbfbfb] px-4 py-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                    A
                  </span>
                  <Link
                    href={`/dashboard/sources/${left.id}`}
                    className="text-[13px] font-bold text-memora-primary hover:underline truncate max-w-[70%]"
                  >
                    Open detail
                  </Link>
                </div>
                <div className="bg-[#fbfbfb] px-4 py-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                    B
                  </span>
                  <Link
                    href={`/dashboard/sources/${right.id}`}
                    className="text-[13px] font-bold text-memora-primary hover:underline truncate max-w-[70%]"
                  >
                    Open detail
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {rows.map((row) => {
                  const diff = row.a !== row.b;
                  const q = query.trim();
                  const bothMatch =
                    q.length > 0 &&
                    textIncludesQuery(row.a, q) &&
                    textIncludesQuery(row.b, q);
                  return (
                    <div
                      key={row.key}
                      className={`grid grid-cols-1 md:grid-cols-2 ${diff ? "bg-amber-50/40" : ""} ${
                        bothMatch ? "ring-1 ring-inset ring-lime-300/80" : ""
                      }`}
                    >
                      <div className="px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100">
                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                          {row.label}
                        </div>
                        {row.key === "url" ? (
                          <a
                            href={left.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-semibold text-memora-primary break-all inline-flex items-start gap-1 hover:underline"
                          >
                            <span className="break-all">
                              <HighlightedInline
                                text={row.a}
                                query={query}
                                bothSides={bothMatch}
                              />
                            </span>
                            <ExternalLink size={14} className="shrink-0 mt-0.5 opacity-70" />
                          </a>
                        ) : row.key === "favorite" ? (
                          <span className="text-[13px] font-semibold text-gray-800 inline-flex items-center gap-1 flex-wrap">
                            {left.is_favorite ? (
                              <Star size={14} className="text-amber-500 fill-amber-400 shrink-0" />
                            ) : null}
                            <HighlightedInline
                              text={row.a}
                              query={query}
                              bothSides={bothMatch}
                            />
                          </span>
                        ) : (
                          <p className="text-[13px] font-medium text-gray-800 whitespace-pre-wrap break-words">
                            <HighlightedInline
                              text={row.a}
                              query={query}
                              bothSides={bothMatch}
                            />
                          </p>
                        )}
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 md:hidden">
                          {row.label} (B)
                        </div>
                        {row.key === "url" ? (
                          <a
                            href={right.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-semibold text-memora-primary break-all inline-flex items-start gap-1 hover:underline"
                          >
                            <span className="break-all">
                              <HighlightedInline
                                text={row.b}
                                query={query}
                                bothSides={bothMatch}
                              />
                            </span>
                            <ExternalLink size={14} className="shrink-0 mt-0.5 opacity-70" />
                          </a>
                        ) : row.key === "favorite" ? (
                          <span className="text-[13px] font-semibold text-gray-800 inline-flex items-center gap-1 flex-wrap">
                            {right.is_favorite ? (
                              <Star size={14} className="text-amber-500 fill-amber-400 shrink-0" />
                            ) : null}
                            <HighlightedInline
                              text={row.b}
                              query={query}
                              bothSides={bothMatch}
                            />
                          </span>
                        ) : (
                          <p className="text-[13px] font-medium text-gray-800 whitespace-pre-wrap break-words">
                            <HighlightedInline
                              text={row.b}
                              query={query}
                              bothSides={bothMatch}
                            />
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
