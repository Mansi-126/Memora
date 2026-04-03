"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { DownloadCloud, Link2, Zap, Loader2, ChevronDown, Upload } from "lucide-react";
import {
  parseUrlsFromBulkText,
  countNonEmptyLines,
} from "@/lib/bulk-import-urls";
import { refreshDashboardSidebar } from "@/lib/dashboard-events";

const IMPORT_TABS = [
  { id: "links", label: "Links" },
  { id: "manual", label: "Manual Copy-Paste" },
  { id: "csv", label: "CSV Upload" },
];

function domainsFromUrls(urls) {
  const counts = new Map();
  for (const href of urls) {
    try {
      const h = new URL(href).hostname.replace(/^www\./i, "");
      counts.set(h, (counts.get(h) || 0) + 1);
    } catch {
      /* skip */
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export default function BulkImportPage() {
  const [input, setInput] = useState("");
  const [folders, setFolders] = useState([]);
  const [folderId, setFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [foldersError, setFoldersError] = useState("");
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState("neutral");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("links");
  const [showDomainRouter, setShowDomainRouter] = useState(false);
  const [csvFileName, setCsvFileName] = useState("");
  const csvInputRef = useRef(null);

  const loadFolders = useCallback(async () => {
    const res = await fetch("/api/folders", { credentials: "include", cache: "no-store" });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || "Failed to load folders");
    setFolders(payload.data || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingFolders(true);
      setFoldersError("");
      try {
        await loadFolders();
      } catch (e) {
        if (!cancelled) {
          setFolders([]);
          setFoldersError(e.message || "Could not load notebooks");
        }
      } finally {
        if (!cancelled) setLoadingFolders(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadFolders]);

  const parsedUrls = useMemo(() => parseUrlsFromBulkText(input), [input]);
  const preview = useMemo(
    () => ({
      unique: parsedUrls.length,
      total: countNonEmptyLines(input),
    }),
    [input, parsedUrls.length]
  );
  const domainGroups = useMemo(() => domainsFromUrls(parsedUrls), [parsedUrls]);

  const selectedFolder = folders.find((f) => f.id === folderId);

  const canImport = !submitting && input.trim().length > 0 && (activeTab === "links" ? preview.unique > 0 : true);

  async function createFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    setStatus("");
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Could not create folder");
      setFolders((prev) => [...prev, payload.data].sort((a, b) => a.name.localeCompare(b.name)));
      setFolderId(payload.data.id);
      setNewFolderName("");
      setShowNewFolder(false);
      setStatus("Notebook created.");
      setStatusTone("ok");
      refreshDashboardSidebar();
    } catch (e) {
      setStatus(e.message || "Failed to create folder");
      setStatusTone("err");
    }
  }

  async function handleImportLinks() {
    if (!canImport) return;
    setSubmitting(true);
    setStatus("");
    setStatusTone("neutral");
    try {
      const res = await fetch("/api/sources/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          // backend supports `text` OR `paste` and will extract https:// links either way.
          ...(activeTab === "manual" ? { paste: input } : { text: input }),
          folder_id: folderId || null,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Import failed");

      let msg = `Imported ${payload.imported} source${payload.imported === 1 ? "" : "s"}`;
      if (payload.skippedDuplicate) {
        msg += ` · ${payload.skippedDuplicate} duplicate${payload.skippedDuplicate === 1 ? "" : "s"} skipped`;
      }
      if (payload.failed) msg += ` · ${payload.failed} failed`;
      msg += ".";
      if (payload.skipped_urls?.length) {
        msg += ` (${payload.skipped_urls.slice(0, 3).join(", ")}${payload.skipped_urls.length > 3 ? "…" : ""})`;
      }
      if (payload.failures?.length) msg += ` ${payload.failures[0].message}`;

      setStatus(msg);
      if (payload.imported === 0 && !payload.failed && payload.skippedDuplicate > 0) {
        setStatusTone("warn");
      } else if (payload.failed) {
        setStatusTone("warn");
      } else {
        setStatusTone("ok");
      }

      if (payload.imported > 0) {
        setInput("");
        refreshDashboardSidebar();
      }
    } catch (e) {
      setStatus(e.message || "Import failed");
      setStatusTone("err");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCsvFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const urls = parseUrlsFromBulkText(text);
      if (urls.length === 0) {
        setStatus("No URLs found in that file. Use a .csv or .txt with http(s) links.");
        setStatusTone("warn");
        return;
      }
      setInput(urls.join("\n"));
      setActiveTab("links");
      setStatus(
        `Loaded ${urls.length} URL${urls.length === 1 ? "" : "s"} from ${file.name}. Review and click Import.`
      );
      setStatusTone("ok");
    };
    reader.onerror = () => {
      setStatus("Could not read the file.");
      setStatusTone("err");
    };
    reader.readAsText(file);
  }

  return (
    <div className="max-w-[800px] w-full">
      <div className="text-[13px] text-gray-500 mb-2 flex items-center gap-1">
        <span>Tools</span>
        <span className="text-gray-300">›</span>
        <span className="text-gray-900 font-medium">Bulk import</span>
      </div>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] flex items-center justify-center text-memora-primary shrink-0">
          <DownloadCloud size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900 tracking-tight">
            Bulk import
          </h1>
          <p className="mt-2 text-[15px] text-gray-600 font-medium leading-relaxed">
            Import from URLs (Links tab) or paste any text that contains https:// links (Manual Copy-Paste tab).
            They are saved in <span className="text-gray-800 font-semibold">Supabase</span> (type{" "}
            <code className="text-[13px] bg-gray-100 px-1 rounded">manual</code>). Duplicates (same URL) are skipped.
            Up to 500 links per import.{" "}
            <Link href="/dashboard/sources" className="text-memora-primary font-semibold hover:underline">
              Sources
            </Link>{" "}
            for single saves.
          </p>
        </div>
      </div>

      {status ? (
        <p
          className={`mb-4 text-sm font-semibold ${
            statusTone === "err"
              ? "text-red-600"
              : statusTone === "warn"
                ? "text-amber-800"
                : statusTone === "ok"
                  ? "text-memora-primary"
                  : "text-gray-600"
          }`}
        >
          {status}
        </p>
      ) : null}

      {foldersError ? (
        <p className="mb-4 text-sm font-semibold text-red-600">
          {foldersError}{" "}
          <button
            type="button"
            onClick={async () => {
              setFoldersError("");
              setLoadingFolders(true);
              try {
                await loadFolders();
              } catch (err) {
                setFoldersError(err.message || "Retry failed");
              } finally {
                setLoadingFolders(false);
              }
            }}
            className="text-memora-primary font-bold hover:underline"
          >
            Retry
          </button>
        </p>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
            Target notebook
          </div>
          {loadingFolders ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
              <Loader2 size={18} className="animate-spin" />
              Loading notebooks…
            </div>
          ) : showNewFolder ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
                placeholder="New notebook name"
                className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-memora-primary/25 focus:border-memora-primary"
              />
              <button
                type="button"
                onClick={createFolder}
                className="px-5 py-3.5 rounded-xl bg-memora-primary text-white text-[14px] font-bold hover:bg-memora-dark transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewFolder(false);
                  setNewFolderName("");
                }}
                className="px-4 py-3.5 rounded-xl border border-gray-200 text-[14px] font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="relative flex-1 min-w-0 max-w-md">
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-[14px] font-semibold text-gray-900 focus:outline-none focus:border-memora-primary cursor-pointer"
                >
                  <option value="">Select a notebook…</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowNewFolder(true)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-[13px] font-extrabold text-gray-800 hover:bg-gray-50 transition-colors shrink-0 whitespace-nowrap"
              >
                + New
              </button>
            </div>
          )}
          {selectedFolder ? (
            <p className="mt-2 text-[12px] font-medium text-gray-500">
              Imports go into <span className="text-gray-800 font-semibold">{selectedFolder.name}</span>
            </p>
          ) : !folderId ? (
            <p className="mt-2 text-[12px] font-medium text-gray-500">
              No notebook — sources go to your library without a folder.
            </p>
          ) : null}
        </div>

        <div className="px-6 pt-2 pb-0">
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">
            Import method
          </div>
          <div className="flex border-b border-gray-200 overflow-x-auto gap-0 -mx-6 px-6">
            {IMPORT_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setStatus("");
                  }}
                  className={`px-5 py-3 text-[14px] font-bold whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                    active
                      ? "border-memora-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 pt-5">
          {activeTab === "links" ? (
            <>
              <div className="bg-memora-light border-l-[3px] border-memora-primary rounded-r-xl px-4 py-3.5 mb-5">
                <p className="text-[14px] font-medium text-gray-700 leading-relaxed">
                  Paste one URL per line. We&apos;ll validate and import all valid HTTP/HTTPS links into{" "}
                  Supabase{selectedFolder ? ` (${selectedFolder.name})` : ""}. Same URL as an existing source is skipped.
                </p>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full min-h-[240px] border border-gray-200 rounded-xl p-4 font-mono text-[13px] text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:border-memora-primary focus:ring-2 focus:ring-memora-primary/15 resize-y shadow-inner placeholder:text-gray-400"
                placeholder={"https://example.com/article1\nhttps://example.com/article2\nhttps://example.com/article3"}
              />

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12px] font-semibold text-gray-500">
                <span>
                  {preview.unique} valid URL{preview.unique === 1 ? "" : "s"} detected
                  {input.trim() ? ` · ${preview.total} non-empty line${preview.total === 1 ? "" : "s"}` : ""}
                  {preview.unique === 0 && input.trim() ? " — add http(s):// links" : ""}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (!text || !String(text).trim()) {
                        setStatus("Clipboard is empty.");
                        setStatusTone("warn");
                        return;
                      }
                      setInput(text);
                      setStatusTone("ok");
                      setStatus("Pasted from clipboard.");
                    } catch (e) {
                      setStatus(e.message || "Could not read clipboard. Paste manually instead.");
                      setStatusTone("err");
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-extrabold text-[12px] whitespace-nowrap"
                  title="Reads clipboard and pastes into the textbox"
                >
                  Paste
                </button>
                <Link href="/dashboard/sources" className="text-memora-primary font-bold hover:underline">
                  View sources →
                </Link>
              </div>
            </>
          ) : activeTab === "manual" ? (
            <>
              <div className="bg-memora-light border-l-[3px] border-memora-primary rounded-r-xl px-4 py-3.5 mb-5">
                <p className="text-[14px] font-medium text-gray-700 leading-relaxed">
                  Copy/paste any text (for example a chat, article, or notes). We extract valid https:// links and import
                  them into{" "}
                  Supabase{selectedFolder ? ` (${selectedFolder.name})` : ""}. If no links are found, we save your pasted text
                  as a manual note.
                </p>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full min-h-[240px] border border-gray-200 rounded-xl p-4 font-mono text-[13px] text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:border-memora-primary focus:ring-2 focus:ring-memora-primary/15 resize-y shadow-inner placeholder:text-gray-400"
                placeholder={"Paste any text with https:// links…\nExample:\nCheck this: https://example.com/blog/123\nAlso see https://example.com/paper.pdf"}
              />

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12px] font-semibold text-gray-500">
                <span>
                  {preview.unique > 0 ? (
                    <>
                      {preview.unique} valid URL{preview.unique === 1 ? "" : "s"} extracted
                    </>
                  ) : input.trim() ? (
                    <>No valid http(s):// links found</>
                  ) : (
                    <>Paste something</>
                  )}
                  {input.trim() ? ` · ${preview.total} non-empty line${preview.total === 1 ? "" : "s"}` : ""}
                  {preview.unique === 0 && input.trim() ? " — will save pasted text as a manual note." : ""}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (!text || !String(text).trim()) {
                        setStatus("Clipboard is empty.");
                        setStatusTone("warn");
                        return;
                      }
                      setInput(text);
                      setStatusTone("ok");
                      setStatus("Pasted from clipboard.");
                    } catch (e) {
                      setStatus(e.message || "Could not read clipboard. Paste manually instead.");
                      setStatusTone("err");
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-extrabold text-[12px] whitespace-nowrap"
                  title="Reads clipboard and pastes into the textbox"
                >
                  Paste
                </button>
                <Link href="/dashboard/sources" className="text-memora-primary font-bold hover:underline">
                  View sources →
                </Link>
              </div>
            </>
          ) : activeTab === "csv" ? (
            <div className="space-y-4">
              <div className="bg-memora-light border-l-[3px] border-memora-primary rounded-r-xl px-4 py-3.5">
                <p className="text-[14px] font-medium text-gray-700 leading-relaxed">
                  Upload a <strong className="text-gray-900">.csv</strong> or text file. Any cell or line that
                  contains an <code className="text-[12px] bg-white/80 px-1 rounded">https://</code> link is
                  extracted, deduplicated, and placed in the editor — then use{" "}
                  <strong className="text-gray-900">Import</strong> on the Manual Copy-Paste tab (we switch you
                  there automatically).
                </p>
              </div>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv,text/plain,.txt"
                className="hidden"
                onChange={handleCsvFile}
              />
              <button
                type="button"
                onClick={() => csvInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white text-[14px] font-extrabold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <Upload size={18} className="text-memora-primary" />
                Choose file
              </button>
              {csvFileName ? (
                <p className="text-[12px] font-medium text-gray-500">Last file: {csvFileName}</p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-14 text-center">
              <p className="text-[15px] font-bold text-gray-800 mb-1">
                {IMPORT_TABS.find((t) => t.id === activeTab)?.label}
              </p>
              <p className="text-[14px] font-medium text-gray-500 max-w-sm mx-auto">
                Not available yet. Use <strong className="text-gray-700">Manual Copy-Paste</strong> to paste URLs, or{" "}
                <strong className="text-gray-700">CSV Upload</strong> to load links from a file.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("links")}
                  className="text-[14px] font-bold text-memora-primary hover:underline"
                >
                  Switch to Manual Copy-Paste
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("csv")}
                  className="text-[14px] font-bold text-memora-primary hover:underline"
                >
                  CSV Upload
                </button>
              </div>
            </div>
          )}

          {showDomainRouter && (activeTab === "links" || activeTab === "manual") ? (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <p className="text-[11px] font-extrabold text-blue-800 uppercase tracking-widest mb-3">
                Domain router
              </p>
              {parsedUrls.length === 0 ? (
                <p className="text-[13px] font-medium text-gray-600">
                  Paste text containing https:// links to see counts per domain.
                </p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {domainGroups.map(([host, n]) => (
                    <li
                      key={host}
                      className="flex items-center justify-between text-[13px] font-semibold text-gray-800"
                    >
                      <span className="truncate pr-2">{host}</span>
                      <span className="text-gray-500 tabular-nums shrink-0">
                        {n} link{n === 1 ? "" : "s"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={!canImport}
              onClick={handleImportLinks}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-memora-primary text-white text-[14px] font-extrabold hover:bg-memora-dark disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Link2 size={18} strokeWidth={2.2} />}
              {submitting ? "Importing…" : activeTab === "links" ? "Import links" : "Import"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeTab === "csv") setActiveTab("links");
                setShowDomainRouter((v) => !v);
              }}
              className="sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-[14px] font-extrabold hover:bg-blue-100 transition-colors"
            >
              <Zap size={18} strokeWidth={2.2} className="text-blue-600" />
              Domain router
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
