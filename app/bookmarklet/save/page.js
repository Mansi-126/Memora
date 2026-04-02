"use client";

import { useEffect, useState } from "react";

export default function BookmarkletSavePage() {
  const [status, setStatus] = useState("Saving to Memora...");
  const [error, setError] = useState("");

  useEffect(() => {
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
          // tiny wait to avoid race between opener setting name and this page booting
          await new Promise((resolve) => setTimeout(resolve, 25));
        }

        if (!payload) {
          const url = new URL(window.location.href);
          const raw = url.searchParams.get("p");
          if (!raw) throw new Error("Missing bookmark payload.");
          try {
            payload = JSON.parse(decodeURIComponent(raw));
          } catch {
            throw new Error("Invalid bookmark payload.");
          }
        }

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

        setStatus("Saved to Memora");
        setTimeout(() => {
          window.close();
        }, 1200);
      } catch (e) {
        setStatus("Could not save");
        setError(e.message || "Unknown error");
      }
    }

    run();
  }, []);

  const isOk = !error;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div
        className={`rounded-full px-6 py-3 text-white text-base font-semibold shadow-lg ${
          isOk ? "bg-emerald-600" : "bg-red-600"
        }`}
      >
        {isOk ? "✓ " : "! "}
        {status}
      </div>
      {error ? <p className="mt-4 text-sm text-gray-600">{error}</p> : null}
    </div>
  );
}

