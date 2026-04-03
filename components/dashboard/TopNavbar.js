"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu } from "lucide-react";

export default function TopNavbar({ onMenuClick }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== "/") return;
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) return;
      if (t instanceof HTMLElement && t.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    const term = q.trim();
    const qs = term ? `?q=${encodeURIComponent(term)}` : "";
    router.push(`/dashboard/sources${qs}`);
  }

  return (
    <nav className="sticky top-0 z-[54] h-[72px] bg-white border-b border-memora-border flex items-center px-4 sm:px-6 md:px-8 gap-3">
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden shrink-0 text-memora-dark hover:bg-memora-light p-1.5 rounded-md"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      <form onSubmit={submitSearch} className="flex-1 min-w-0 max-w-[560px]">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search all sources…"
            autoComplete="off"
            className="w-full h-11 pl-10 sm:pl-12 pr-10 sm:pr-12 rounded-full border border-gray-200 bg-gray-50/50 text-[15px] focus:outline-none focus:border-memora-primary focus:bg-white transition-all font-medium text-memora-text placeholder-gray-400"
          />
          <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 bg-white border border-gray-200 px-1.5 sm:px-2 py-0.5 rounded-md">
              /
            </span>
          </div>
        </div>
      </form>
    </nav>
  );
}
