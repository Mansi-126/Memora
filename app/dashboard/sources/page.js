"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MEMORA_DASHBOARD_REFRESH, refreshDashboardSidebar } from "@/lib/dashboard-events";
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Download, FolderInput, Trash2, ChevronDown, FolderPlus, 
  Search, Filter, RotateCw, Square, Star, Folder, Tag
} from "lucide-react";

function SourcesPageContent() {
  const searchParams = useSearchParams();
  const [sources, setSources] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const loadSources = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const folderQuery = selectedFolderId ? `?folder_id=${encodeURIComponent(selectedFolderId)}` : "";
      const response = await fetch(`/api/sources${folderQuery}`, { credentials: "include", cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to load sources");
      setSources(Array.isArray(payload.data) ? payload.data : []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.message || "Unable to fetch sources");
    } finally {
      setLoading(false);
    }
  }, [selectedFolderId]);

  const loadFolders = useCallback(async () => {
    try {
      const response = await fetch("/api/folders", { credentials: "include", cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to load folders");
      setFolders(Array.isArray(payload.data) ? payload.data : []);
    } catch (err) {
      setError(err.message || "Unable to fetch folders");
    }
  }, []);

  useEffect(() => {
    void loadSources();
  }, [loadSources]);

  useEffect(() => {
    void loadFolders();
    function onDashboardRefresh() {
      void loadFolders();
    }
    window.addEventListener(MEMORA_DASHBOARD_REFRESH, onDashboardRefresh);
    return () => window.removeEventListener(MEMORA_DASHBOARD_REFRESH, onDashboardRefresh);
  }, [loadFolders]);

  useEffect(() => {
    const fromUrl = searchParams.get("q");
    if (fromUrl == null) return;
    setQuery(fromUrl);
  }, [searchParams]);

  const filteredSources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sources;
    return sources.filter((item) => {
      const hay = [
        item.title,
        item.source_url,
        item.platform,
        item.source_type,
        item.selected_text,
        typeof item.content === "string" ? item.content.slice(0, 20000) : item.content,
        item.metadata && typeof item.metadata === "object" ? JSON.stringify(item.metadata).slice(0, 5000) : item.metadata,
      ]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase());
      return hay.some((s) => s.includes(q));
    });
  }, [query, sources]);

  const folderNameById = useMemo(() => {
    const m = new Map();
    folders.forEach((f) => m.set(f.id, f.name));
    return m;
  }, [folders]);

  const allFilteredSelected =
    filteredSources.length > 0 && filteredSources.every((item) => selectedIds.includes(item.id));

  function toggleSourceSelection(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAllFiltered() {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredSources.some((item) => item.id === id)));
      return;
    }
    const ids = filteredSources.map((x) => x.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  }

  async function createFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    setActionStatus("");
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to create folder");
      setFolders((prev) => [...prev, payload.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewFolderName("");
      setShowNewFolderInput(false);
      setActionStatus("Folder created");
      refreshDashboardSidebar();
    } catch (err) {
      setActionStatus(err.message || "Failed to create folder");
    }
  }

  async function moveSelectedToFolder(folderId) {
    if (selectedIds.length === 0) return;
    setActionStatus("");
    try {
      const response = await fetch("/api/sources/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: selectedIds, folder_id: folderId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to move sources");
      setActionStatus(`Moved ${payload.data?.length ?? 0} item(s)`);
      setShowMoveMenu(false);
      await loadSources();
      refreshDashboardSidebar();
    } catch (err) {
      setActionStatus(err.message || "Failed to move sources");
    }
  }

  async function deleteSelected() {
    if (selectedIds.length === 0) return;
    const ok = window.confirm(`Delete ${selectedIds.length} selected source(s)?`);
    if (!ok) return;
    setActionStatus("");
    try {
      const response = await fetch("/api/sources/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: selectedIds }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to delete sources");
      setActionStatus(`Deleted ${payload.data?.length ?? 0} item(s)`);
      await loadSources();
      refreshDashboardSidebar();
    } catch (err) {
      setActionStatus(err.message || "Failed to delete sources");
    }
  }

  async function toggleFavorite(item) {
    const nextFavorite = !item.is_favorite;
    const previous = sources;
    setSources((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, is_favorite: nextFavorite } : x))
    );
    try {
      const response = await fetch("/api/sources/by-id", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: item.id, is_favorite: nextFavorite }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to update favorite");
      setActionStatus(nextFavorite ? "Added to favorites" : "Removed from favorites");
      refreshDashboardSidebar();
    } catch (err) {
      setSources(previous);
      setActionStatus(err.message || "Failed to update favorite");
    }
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
      
      <p className="text-sm font-medium text-gray-500 mb-4">
        {selectedFolderId ? `Showing folder: ${folderNameById.get(selectedFolderId) || "Unknown"}` : "Showing every folder"}
      </p>
      
      <hr className="border-gray-200 mb-5" />
      
      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
        {/* Left Actions */}
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-300 cursor-not-allowed">
            <Download size={16} strokeWidth={2.5} /> Download
          </button>
          <div className="relative">
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() => setShowMoveMenu((s) => !s)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
            >
            <FolderInput size={16} strokeWidth={2.5} /> Move to Folder
          </button>
            {showMoveMenu ? (
              <div className="absolute left-0 mt-2 z-20 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                <button
                  type="button"
                  onClick={() => moveSelectedToFolder(null)}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50"
                >
                  Remove from folder
                </button>
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => moveSelectedToFolder(folder.id)}
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50"
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={deleteSelected}
            className="flex items-center gap-2 text-sm font-semibold text-[#f87171] hover:text-red-500 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} strokeWidth={2.5} /> Delete
          </button>
        </div>
        
        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-3 pb-1">
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white min-w-[160px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <option value="">All Folders</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewFolderInput((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
          >
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

      {showNewFolderInput ? (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-[260px]"
          />
          <button
            type="button"
            onClick={createFolder}
            className="px-3 py-2 rounded-lg bg-memora-primary text-white text-sm font-semibold"
          >
            Create
          </button>
        </div>
      ) : null}

      {actionStatus ? <div className="mb-3 text-sm font-medium text-gray-600">{actionStatus}</div> : null}
      
      {/* Table Area */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {/* Table Header */}
        <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 bg-white text-xs font-semibold text-gray-400">
          <div className="flex">
            <div className="w-[50px] p-4 flex items-center justify-center border-r border-gray-200">
              <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAllFiltered} />
            </div>
            <div className="w-[50px] p-4 flex items-center justify-center border-r border-gray-200">
              <Star size={16} className="text-gray-300" />
            </div>
          </div>
          <div className="flex-[2] min-w-[200px] p-4 flex items-center gap-2 md:border-r border-gray-200 px-6">
            <span className="text-[10px] font-bold text-gray-400 tracking-tighter">AA</span> Name
          </div>
          <div className="flex-1 min-w-[150px] p-4 flex items-center gap-2 border-t md:border-t-0 md:border-r border-gray-200">
            <Folder size={14} className="text-gray-300" /> Folder
          </div>
          <div className="flex-1 min-w-[150px] p-4 flex items-center gap-2 border-t md:border-t-0 md:border-r border-gray-200">
            <Tag size={14} className="text-gray-300" /> Platform
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
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSourceSelection(item.id)}
                    />
                  </div>
                  <div className="w-[50px] p-4 border-r border-gray-100 flex items-center justify-center">
                    <button type="button" onClick={() => toggleFavorite(item)}>
                      <Star size={16} className={item.is_favorite ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                    </button>
                  </div>
                </div>
                <div className="flex-[2] min-w-[200px] p-4 px-6 overflow-hidden">
                  <Link href={`/dashboard/sources/${item.id}`} className="font-semibold text-gray-900 block truncate hover:text-memora-primary">
                    {item.title}
                  </Link>
                  {/^https?:\/\//i.test(item.source_url || "") ? (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-memora-primary truncate block mt-0.5"
                    >
                      {item.source_url}
                    </a>
                  ) : null}
                </div>
                <div className="flex-1 min-w-[150px] p-4 border-t md:border-t-0 md:border-l border-gray-100 text-gray-700 truncate">
                  {item.folder_id ? folderNameById.get(item.folder_id) || "Unknown folder" : "Unfiled"}
                </div>
                <div className="flex-1 min-w-[150px] p-4 border-t md:border-t-0 md:border-l border-gray-100 text-gray-700 truncate">
                  {item.platform || "web"}
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
        <div className="mb-4 md:mb-0">{selectedIds.length} of {filteredSources.length} row(s) selected.</div>
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

export default function SourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-full p-12 text-center text-gray-500 text-sm font-medium">Loading sources…</div>
      }
    >
      <SourcesPageContent />
    </Suspense>
  );
}
