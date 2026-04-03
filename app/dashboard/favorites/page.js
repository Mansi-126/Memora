"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star, Folder } from "lucide-react";

export default function FavoritesPage() {
  const [sources, setSources] = useState([]);
  const [folders, setFolders] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sRes, fRes] = await Promise.all([
        fetch("/api/sources?is_favorite=true", { credentials: "include", cache: "no-store" }),
        fetch("/api/folders", { credentials: "include", cache: "no-store" }),
      ]);
      const sPayload = await sRes.json();
      const fPayload = await fRes.json();
      if (!sRes.ok) throw new Error(sPayload.error || "Failed to load favorite sources");
      if (!fRes.ok) throw new Error(fPayload.error || "Failed to load notebooks");
      setSources((sPayload.data || []).filter((x) => x.is_favorite === true));
      setFolders((fPayload.data || []).filter((f) => f.is_favorite === true));
    } catch (e) {
      setError(e.message || "Unable to fetch favorites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredFolders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return folders;
    return folders.filter((f) => String(f.name || "").toLowerCase().includes(q));
  }, [folders, query]);

  const filteredSources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sources;
    return sources.filter((x) =>
      [x.title, x.source_url, x.platform].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sources, query]);

  const hasAny = folders.length > 0 || sources.length > 0;
  const hasFiltered = filteredFolders.length > 0 || filteredSources.length > 0;

  async function unfavoriteNotebook(folder) {
    const prev = [...folders];
    setFolders((p) => p.filter((f) => f.id !== folder.id));
    setError("");
    try {
      const res = await fetch(`/api/folders/${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_favorite: false }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Update failed");
    } catch (e) {
      setFolders(prev);
      setError(e.message || "Failed to remove notebook from favorites");
    }
  }

  return (
    <div className="max-w-[1000px]">
      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Organize / Tools</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Favorites</span>
      </div>
      <h1 className="text-[32px] font-bold text-gray-900 tracking-tight mb-8">Favorites</h1>

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notebooks and sources..."
          className="w-full md:w-[320px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-memora-primary shadow-sm transition-colors"
        />
      </div>

      {error ? <div className="mb-4 text-sm font-semibold text-red-500">{error}</div> : null}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">Loading favorites...</div>
        ) : !hasAny ? (
          <div className="p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
              <Star size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 text-sm max-w-[340px]">
              Star a notebook on <Link href="/dashboard" className="font-semibold text-memora-primary hover:underline">All Notebooks</Link>
              , or star a source on <Link href="/dashboard/sources" className="font-semibold text-memora-primary hover:underline">Sources</Link>.
            </p>
          </div>
        ) : !hasFiltered ? (
          <div className="p-12 text-center text-sm text-gray-500 font-medium">No matches for your search.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredFolders.length > 0 ? (
              <div>
                <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100">
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Favorite notebooks</h2>
                </div>
                {filteredFolders.map((folder) => (
                  <div key={folder.id} className="p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                    <button
                      type="button"
                      onClick={() => unfavoriteNotebook(folder)}
                      className="shrink-0 pt-0.5 rounded-lg hover:bg-red-50 text-amber-500 fill-amber-400 hover:text-gray-300 hover:fill-transparent transition-all cursor-pointer group"
                      title="Remove notebook from favorites"
                      aria-label="Remove notebook from favorites"
                    >
                      <Star size={20} className="fill-amber-400 text-amber-500 group-hover:fill-transparent transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0 flex items-start gap-3">
                      <span className="shrink-0 w-9 h-9 rounded-lg bg-memora-light flex items-center justify-center text-memora-primary">
                        <Folder size={18} strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/collections?folder=${folder.id}`}
                          className="block font-semibold text-gray-900 hover:text-memora-primary mb-0.5 truncate"
                        >
                          {folder.name}
                        </Link>
                        <p className="text-xs text-gray-500 font-medium">Notebook · open in Collections</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {filteredSources.length > 0 ? (
              <div>
                {filteredFolders.length > 0 ? (
                  <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100">
                    <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Favorite sources</h2>
                  </div>
                ) : null}
                {filteredSources.map((item) => (
                  <div key={item.id} className="p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                    <button
                      type="button"
                      onClick={async () => {
                        const revertSources = [...sources];
                        setSources((prev) => prev.filter((x) => x.id !== item.id));
                        setError("");
                        try {
                          const res = await fetch(`/api/sources/${item.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ is_favorite: false }),
                          });
                          if (!res.ok) throw new Error();
                        } catch {
                          setSources(revertSources);
                          setError("Failed to un-favorite source");
                        }
                      }}
                      className="shrink-0 pt-0.5 rounded-lg hover:bg-red-50 text-yellow-500 fill-yellow-500 hover:text-gray-300 hover:fill-transparent transition-all cursor-pointer group"
                      title="Remove from favorites"
                    >
                      <Star size={20} className="fill-yellow-500 group-hover:fill-transparent transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/sources/${item.id}`}
                        className="block font-semibold text-gray-900 hover:text-memora-primary mb-1 truncate"
                      >
                        {item.title}
                      </Link>
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs text-memora-primary truncate hover:underline max-w-fit"
                      >
                        {item.source_url}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
