"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Folder, ArrowLeft, Files, FolderInput, Trash2 } from "lucide-react";

export default function CollectionsPage() {
  const [folders, setFolders] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [busyId, setBusyId] = useState(null);

  const reloadData = useCallback(async () => {
    const [fRes, sRes] = await Promise.all([
      fetch("/api/folders", { credentials: "include" }),
      fetch("/api/sources", { credentials: "include" }),
    ]);
    const fPayload = await fRes.json();
    const sPayload = await sRes.json();
    if (!fRes.ok) throw new Error(fPayload.error || "Failed to load folders");
    if (!sRes.ok) throw new Error(sPayload.error || "Failed to load sources");
    setFolders(fPayload.data || []);
    setSources(sPayload.data || []);
  }, []);

  async function removeFromFolder(item) {
    setBusyId(item.id);
    setActionStatus("");
    try {
      const res = await fetch("/api/sources/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: [item.id], folder_id: null }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Could not remove from folder");
      setSources((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, folder_id: null } : s))
      );
      setActionStatus("Removed from folder");
    } catch (e) {
      setActionStatus(e.message || "Remove failed");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteSource(item) {
    const ok = window.confirm(`Delete "${item.title}"? This cannot be undone.`);
    if (!ok) return;
    setBusyId(item.id);
    setActionStatus("");
    try {
      const res = await fetch("/api/sources/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: [item.id] }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Could not delete");
      setSources((prev) => prev.filter((s) => s.id !== item.id));
      setActionStatus("Deleted");
    } catch (e) {
      setActionStatus(e.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        await reloadData();
      } catch (e) {
        setError(e.message || "Failed to load collections");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reloadData]);

  const selectedFolder = useMemo(
    () => folders.find((f) => f.id === selectedFolderId),
    [folders, selectedFolderId]
  );

  const folderSources = useMemo(() => {
    if (!selectedFolderId) return [];
    return sources.filter((s) => s.folder_id === selectedFolderId);
  }, [sources, selectedFolderId]);

  return (
    <div className="max-w-[1040px] w-full">
      <div className="text-[13px] text-gray-500 mb-2 flex items-center gap-1">
        <span>Organize</span>
        <span className="text-gray-300">›</span>
        <Link href="/dashboard/collections" onClick={() => setSelectedFolderId("")} className="hover:text-gray-800 transition-colors">Collections</Link>
        {selectedFolder && (
          <>
            <span className="text-gray-300">›</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{selectedFolder.name}</span>
          </>
        )}
      </div>
      
      {!selectedFolderId ? (
        <>
          <h1 className="text-[32px] md:text-[36px] font-bold text-gray-900 tracking-tight mb-8">All Collections</h1>
          
          {error ? <div className="mb-6 text-sm font-semibold text-red-500">{error}</div> : null}
          
          {loading ? (
            <div className="text-sm text-gray-500 font-medium p-12 text-center bg-gray-50/50 rounded-2xl border border-gray-100">Loading collections...</div>
          ) : folders.length === 0 ? (
            <div className="p-16 border border-gray-200 rounded-3xl bg-white text-center flex flex-col items-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="w-20 h-20 bg-memora-light rounded-2xl flex items-center justify-center text-memora-primary mb-6">
                 <Folder size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-3">No collections yet</h3>
              <p className="text-gray-500 text-sm font-medium max-w-sm leading-relaxed">
                Folders you create or save in the Sources page will automatically appear here as collections.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {folders.map((folder) => {
                const count = sources.filter((s) => s.folder_id === folder.id).length;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className="group bg-white border border-gray-200 rounded-[20px] p-6 text-left hover:border-memora-primary hover:shadow-[0_8px_24px_rgba(33,197,94,0.08)] transition-all cursor-pointer flex flex-col items-start justify-between min-h-[170px]"
                  >
                    <div className="w-full flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-[#f0fdf4] group-hover:bg-[#dcfce7] rounded-xl flex items-center justify-center text-memora-primary transition-colors">
                        <Folder size={26} strokeWidth={2.5} />
                      </div>
                      <div className="px-3 py-1.5 bg-gray-50 group-hover:bg-white text-gray-500 group-hover:text-memora-primary text-[11px] font-extrabold uppercase rounded-full border border-gray-100 group-hover:border-memora-primary/20 transition-colors">
                        {count} ITEM{count !== 1 ? 'S' : ''}
                      </div>
                    </div>
                    <div className="w-full">
                      <h3 className="text-[17px] font-extrabold text-gray-900 truncate mb-1">
                        {folder.name}
                      </h3>
                      <p className="text-sm font-semibold text-gray-400 truncate">
                        {folder.description || "Collection"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setSelectedFolderId("")}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <h1 className="text-[32px] md:text-[36px] font-bold text-gray-900 tracking-tight truncate flex-1 leading-none py-1">
              {selectedFolder?.name || "Folder"}
            </h1>
          </div>

          <div className="bg-white border border-gray-200 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 bg-[#fbfbfb] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                <Files size={18} className="text-gray-300" />
                {folderSources.length} SOURCE{folderSources.length !== 1 ? 'S' : ''}
              </div>
              {actionStatus ? (
                <p className={`text-sm font-semibold ${actionStatus.includes("fail") || actionStatus.includes("Could not") ? "text-red-600" : "text-memora-primary"}`}>
                  {actionStatus}
                </p>
              ) : null}
            </div>

            {folderSources.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-[20px] flex items-center justify-center text-gray-300 mb-5 border border-gray-100">
                  <Files size={36} strokeWidth={2} />
                </div>
                <h3 className="text-[20px] font-extrabold text-gray-900 mb-2">No sources found</h3>
                <p className="text-gray-500 text-[15px] font-medium max-w-[320px]">
                  Sources added to this folder will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {folderSources.map((item) => {
                  const busy = busyId === item.id;
                  return (
                    <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <Link href={`/dashboard/sources/${item.id}`} className="block font-bold text-[16px] text-gray-900 hover:text-memora-primary mb-1.5 truncate">
                          {item.title}
                        </Link>
                        <a href={item.source_url} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-memora-primary truncate hover:underline block w-fit max-w-full">
                          {item.source_url}
                        </a>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeFromFolder(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Remove from this folder only"
                        >
                          <FolderInput size={16} strokeWidth={2.5} />
                          Remove
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => deleteSource(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Delete source permanently"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
