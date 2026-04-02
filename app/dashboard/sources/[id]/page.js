"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function SourceDetailPage({ params }) {
  const router = useRouter();
  const { id: sourceId } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    title: "",
    source_url: "",
    selected_text: "",
    created_at: "",
    updated_at: "",
  });

  useEffect(() => {
    if (!sourceId) return;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/sources/by-id?id=${encodeURIComponent(sourceId)}`, { credentials: "include" });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load source");

        setForm({
          title: payload.data?.title || "",
          source_url: payload.data?.source_url || "",
          selected_text:
            payload.data?.selected_text || payload.data?.content || "",
          created_at: payload.data?.created_at || "",
          updated_at: payload.data?.updated_at || "",
        });
      } catch (e) {
        setError(e.message || "Unable to load source");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sourceId]);

  async function saveChanges() {
    if (!sourceId) return;
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const res = await fetch(`/api/sources/by-id`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: sourceId,
          title: form.title,
          selected_text: form.selected_text,
          content: form.selected_text,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to save changes");
      setStatus("Saved changes");
    } catch (e) {
      setError(e.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm font-medium text-gray-500">Loading source...</div>;
  }

  if (error && !form.source_url) {
    return (
      <div className="text-sm text-red-500">
        {error}
      </div>
    );
  }

  const dateLabel = form.updated_at
    ? new Date(form.updated_at).toLocaleString()
    : form.created_at
      ? new Date(form.created_at).toLocaleString()
      : "-";

  return (
    <div className="max-w-[900px] pb-12">
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/sources")}
          className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-800 bg-white shadow-sm hover:bg-gray-50 transition-colors"
        >
          Back to Sources
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <label className="block text-[11px] font-extrabold uppercase text-gray-400 tracking-wider mb-2">
          NAME
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
          className="w-full mb-3 px-4 py-3 border border-gray-200 rounded-xl text-[15px] font-bold text-gray-900 focus:outline-none focus:border-memora-primary shadow-sm hover:border-gray-300 transition-colors"
        />

        <div className="text-[13px] font-medium text-gray-400 mb-6">
          {dateLabel}
        </div>

        <label className="block text-[11px] font-extrabold uppercase text-gray-400 tracking-wider mb-2">
          ORIGINAL URL
        </label>
        <a
          href={form.source_url}
          target="_blank"
          rel="noreferrer"
          className="block text-[14px] font-medium text-memora-primary mb-6 truncate hover:underline"
        >
          {form.source_url}
        </a>

        <label className="block text-[11px] font-extrabold uppercase text-gray-400 tracking-wider mb-2">
          TEXT (EDITABLE)
        </label>
        <textarea
          value={form.selected_text}
          onChange={(e) => setForm((s) => ({ ...s, selected_text: e.target.value }))}
          className="w-full min-h-[280px] p-4 border border-memora-primary/30 rounded-xl text-[14px] text-gray-800 font-medium focus:outline-none focus:border-memora-primary focus:ring-1 focus:ring-memora-primary shadow-sm mb-6 leading-relaxed bg-white hover:border-memora-primary/50 transition-colors"
        />

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={saveChanges}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[#0e9f6e] text-white text-[14px] font-bold shadow-sm hover:bg-[#057a55] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          
          {status && (
            <span className="text-[13px] font-bold text-[#0e9f6e]">
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

