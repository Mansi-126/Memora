"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Plus, Download, FileUp, Loader2, Star, Pencil, Trash2, X } from "lucide-react";

/** One CSV row → fields (handles quoted fields and commas inside quotes). */
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let i = 0;
  let inQ = false;
  while (i < line.length) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        inQ = false;
        i += 1;
        continue;
      }
      cur += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQ = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      out.push(cur);
      cur = "";
      i += 1;
      continue;
    }
    cur += c;
    i += 1;
  }
  out.push(cur);
  return out;
}

function parseImportFile(text) {
  let raw = String(text);
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];
  let start = 0;
  if (/^title\s*,\s*body/i.test(lines[0])) start = 1;
  const rows = [];
  for (let i = start; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length < 2) continue;
    const title = parts[0].trim().replace(/^"|"$/g, "");
    const body = parts
      .slice(1)
      .join(",")
      .trim()
      .replace(/^"|"$/g, "");
    if (title) rows.push({ title: title.slice(0, 500), body: body.slice(0, 100000) });
  }
  return rows;
}

export default function PromptsLibraryPage() {
  const [promptFolders, setPromptFolders] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formFolderId, setFormFolderId] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const importRef = useRef(null);

  const reload = useCallback(async () => {
    const [fRes, pRes] = await Promise.all([
      fetch("/api/prompt-folders", { credentials: "include", cache: "no-store" }),
      fetch("/api/prompts", { credentials: "include", cache: "no-store" }),
    ]);
    const fPayload = await fRes.json();
    const pPayload = await pRes.json();
    if (!fRes.ok) throw new Error(fPayload.error || "Failed to load folders");
    if (!pRes.ok) throw new Error(pPayload.error || "Failed to load prompts");
    setPromptFolders(fPayload.data || []);
    setPrompts(pPayload.data || []);
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

  const allCount = prompts.length;
  const favCount = useMemo(() => prompts.filter((p) => p.is_favorite).length, [prompts]);

  const countInFolder = useCallback(
    (folderId) => prompts.filter((p) => p.folder_id === folderId).length,
    [prompts]
  );

  const filteredPrompts = useMemo(() => {
    let list = prompts;
    if (filter === "favorites") list = list.filter((p) => p.is_favorite);
    else if (filter !== "all") list = list.filter((p) => p.folder_id === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          String(p.title).toLowerCase().includes(q) || String(p.body).toLowerCase().includes(q)
      );
    }
    return list;
  }, [prompts, filter, search]);

  const subheading =
    filter === "all"
      ? "All Prompts"
      : filter === "favorites"
        ? "Favorites"
        : promptFolders.find((f) => f.id === filter)?.name || "Folder";

  function openNewModal() {
    setEditingId(null);
    setFormTitle("");
    setFormBody("");
    setFormFolderId(filter !== "all" && filter !== "favorites" ? filter : "");
    setModalOpen(true);
  }

  function openEditModal(p) {
    setEditingId(p.id);
    setFormTitle(p.title);
    setFormBody(p.body || "");
    setFormFolderId(p.folder_id || "");
    setModalOpen(true);
  }

  async function saveModal() {
    const title = formTitle.trim() || "Untitled prompt";
    const body = formBody;
    const folder_id = formFolderId || null;
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/prompts/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title, body, folder_id }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Save failed");
        setPrompts((prev) => prev.map((x) => (x.id === editingId ? payload.data : x)));
      } else {
        const res = await fetch("/api/prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title, body, folder_id }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Create failed");
        setPrompts((prev) => [payload.data, ...prev]);
      }
      setModalOpen(false);
      setNotice(editingId ? "Prompt updated." : "Prompt created.");
      setError("");
    } catch (e) {
      setError(e.message || "Save failed");
      setNotice("");
    } finally {
      setSaving(false);
    }
  }

  async function toggleFavorite(p) {
    setBusyId(p.id);
    try {
      const next = !p.is_favorite;
      const res = await fetch(`/api/prompts/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_favorite: next }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Update failed");
      setPrompts((prev) => prev.map((x) => (x.id === p.id ? payload.data : x)));
      setNotice("");
      setError("");
    } catch (e) {
      setError(e.message || "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function deletePrompt(p) {
    if (!window.confirm(`Delete “${p.title}”?`)) return;
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/prompts/${p.id}`, { method: "DELETE", credentials: "include" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Delete failed");
      setPrompts((prev) => prev.filter((x) => x.id !== p.id));
      setNotice("Prompt deleted.");
      setError("");
    } catch (e) {
      setError(e.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  async function addFolder() {
    const name = window.prompt("Folder name");
    if (!name?.trim()) return;
    try {
      const res = await fetch("/api/prompt-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Could not create folder");
      setPromptFolders((prev) => [...prev, payload.data].sort((a, b) => a.name.localeCompare(b.name)));
      setFilter(payload.data.id);
      setNotice("Folder created.");
      setError("");
    } catch (e) {
      setError(e.message || "Could not create folder");
    }
  }

  function downloadSampleCsv() {
    const csv =
      "title,body\n" +
      "\"Example prompt\",\"Paste your template here. Commas, like this, work inside quotes.\"";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "memora-prompts-sample.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function downloadBackup() {
    setError("");
    try {
      const { promptsBackupToPdfBlob } = await import("@/lib/prompts-backup-pdf");
      const exportedAt = new Date().toISOString();
      const blob = promptsBackupToPdfBlob({
        promptFolders,
        prompts,
        exportedAt,
      });
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `memora-prompts-backup-${exportedAt.slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice("Backup downloaded (PDF).");
    } catch (e) {
      setNotice("");
      setError(e?.message || "Could not create PDF backup.");
    }
  }

  async function onImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    const rows = parseImportFile(text);
    if (rows.length === 0) {
      setNotice("");
      setError("No rows imported. Use title,body columns (see Sample CSV).");
      return;
    }
    setError("");
    setNotice("");
    let ok = 0;
    for (const row of rows) {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: row.title,
          body: row.body,
          folder_id: filter !== "all" && filter !== "favorites" ? filter : null,
        }),
      });
      if (res.ok) ok += 1;
    }
    await reload();
    if (ok) {
      setNotice(`Imported ${ok} prompt(s).`);
      setError("");
    } else {
      setError("Import failed for all rows.");
      setNotice("");
    }
  }

  return (
    <div className="max-w-[1240px]">
      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Notebooks</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Prompts Library</span>
      </div>
      <h1 className="text-[36px] font-bold text-gray-900 tracking-tight mb-8">Prompts Library</h1>

      {error ? <p className="mb-2 text-sm font-semibold text-red-600">{error}</p> : null}
      {notice ? <p className="mb-4 text-sm font-semibold text-memora-primary">{notice}</p> : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-white border border-gray-200 shadow-xl p-6 relative">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-800"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? "Edit prompt" : "New prompt"}
            </h3>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Title
            </label>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[14px] font-semibold mb-4 focus:outline-none focus:border-memora-primary"
              placeholder="Title"
            />
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Body
            </label>
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              rows={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-medium mb-4 focus:outline-none focus:border-memora-primary resize-y"
              placeholder="Prompt text…"
            />
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Folder
            </label>
            <select
              value={formFolderId}
              onChange={(e) => setFormFolderId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-semibold mb-6 focus:outline-none focus:border-memora-primary"
            >
              <option value="">None</option>
              {promptFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={saveModal}
                className="px-4 py-2 rounded-lg text-[13px] font-bold text-white bg-gray-900 hover:bg-black disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <input ref={importRef} type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={onImportFile} />

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-3">
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-[13px] text-gray-900">Folders</span>
              <button
                type="button"
                onClick={addFolder}
                className="text-gray-400 hover:text-gray-900 border border-gray-200 rounded p-0.5 shadow-sm"
                title="New folder"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="p-2 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setNotice("");
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-bold rounded-lg transition-colors ${
                  filter === "all" ? "bg-red-50 text-gray-900" : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <span>All Prompts</span>
                <span
                  className={`font-medium font-mono text-xs ${filter === "all" ? "text-red-500" : "text-gray-400"}`}
                >
                  {allCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFilter("favorites")}
                className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-bold rounded-lg transition-colors ${
                  filter === "favorites" ? "bg-red-50 text-gray-900" : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <span>Favorites</span>
                <span
                  className={`font-medium font-mono text-xs ${
                    filter === "favorites" ? "text-memora-primary" : "text-gray-400"
                  }`}
                >
                  {favCount}
                </span>
              </button>
              {promptFolders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-bold rounded-lg transition-colors ${
                    filter === f.id ? "bg-red-50 text-gray-900" : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <span className="truncate text-left">{f.name}</span>
                  <span
                    className={`shrink-0 font-medium font-mono text-xs ${
                      filter === f.id ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {countInFolder(f.id)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-9 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-gray-900">Prompts</h2>
              <div className="text-[13px] text-gray-500 font-medium">{subheading}</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={openNewModal}
                className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-[13px] font-bold shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                New Prompt
              </button>
              <button
                type="button"
                onClick={() => importRef.current?.click()}
                className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-2 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
              >
                <FileUp size={14} className="text-gray-500" /> Import
              </button>
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-2 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
              >
                <FileUp size={14} className="text-gray-500" /> Sample CSV
              </button>
              <button
                type="button"
                onClick={() => void downloadBackup()}
                className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-2 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
              >
                <Download size={14} className="text-gray-500" /> Backup
              </button>
              <input
                type="text"
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-medium outline-none focus:border-memora-primary focus:ring-1 focus:ring-memora-primary ml-2 bg-gray-50 focus:bg-white transition-all shadow-sm placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex-1 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col min-h-[320px]">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500 gap-2">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm font-medium">Loading…</span>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-16 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-1 bg-gray-300 rounded-full" />
                </div>
                <p className="text-sm font-medium text-gray-500">No prompts found.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredPrompts.map((p) => {
                  const busy = busyId === p.id;
                  const snippet = (p.body || "").replace(/\s+/g, " ").trim().slice(0, 140);
                  return (
                    <li key={p.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50/80">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => toggleFavorite(p)}
                        className="mt-0.5 text-gray-300 hover:text-amber-500 disabled:opacity-40"
                        title={p.is_favorite ? "Unfavorite" : "Favorite"}
                      >
                        <Star
                          size={18}
                          className={p.is_favorite ? "text-amber-500 fill-amber-400" : ""}
                          strokeWidth={2}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[14px] text-gray-900 truncate">{p.title}</div>
                        {snippet ? (
                          <p className="text-[12px] text-gray-500 font-medium mt-0.5 line-clamp-2">{snippet}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => deletePrompt(p)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
