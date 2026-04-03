"use client";

import { useEffect, useState } from "react";

async function postBookmark(payload) {
  const res = await fetch("/api/sources/bookmark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to save bookmark.");
  }
  return data;
}

export default function BookmarkletSavePage() {
  const [status, setStatus] = useState("Saving…");
  const [error, setError] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    let cancelled = false;

    async function fromPayload(payload) {
      if (!payload || typeof payload !== "object") {
        throw new Error("Invalid bookmark payload.");
      }
      await postBookmark(payload);
      if (cancelled) return;
      setStatus("Saved to Memora");
      window.setTimeout(() => {
        window.close();
      }, 1100);
    }

    async function run() {
      try {
        let payload;
        for (let i = 0; i < 8; i += 1) {
          const fromName = window.name;
          if (fromName) {
            try {
              payload = JSON.parse(fromName);
              window.name = "";
              break;
            } catch {
              payload = null;
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 25));
        }

        if (!payload) {
          const raw = url.searchParams.get("p");
          if (!raw) throw new Error("Missing bookmark payload.");
          try {
            payload = JSON.parse(decodeURIComponent(raw));
          } catch {
            throw new Error("Invalid bookmark payload.");
          }
        }

        await fromPayload(payload);
      } catch (e) {
        if (!cancelled) {
          setStatus("Could not save");
          setError(e.message || "Unknown error");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const isOk = !error;

  return (
    <div className="min-h-[100dvh] w-full flex items-start justify-end p-3 bg-white">
      <div className="flex flex-col items-end gap-2 max-w-[min(300px,calc(100vw-1.5rem))]">
        <div
          className={`rounded-xl px-4 py-2.5 text-white text-sm font-semibold shadow-lg ${
            isOk ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {isOk ? "✓ " : "! "}
          {status}
        </div>
        {error ? (
          <p className="text-right text-xs text-gray-600 leading-snug">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
