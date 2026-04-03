"use client";

import { useEffect, useRef } from "react";
import { X, Bookmark, Copy } from "lucide-react";

export default function BookmarkInstallModal({
  open,
  onClose,
  onInstalled,
  bookmarkletHref,
  onCopy,
  copied,
}) {
  const dragLinkRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (dragLinkRef.current && bookmarkletHref?.startsWith("javascript:")) {
      dragLinkRef.current.setAttribute("href", bookmarkletHref);
    }
  }, [bookmarkletHref, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-[560px] rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="mx-auto w-10 h-10 rounded-xl bg-memora-light text-memora-primary flex items-center justify-center mb-3">
          <Bookmark size={18} fill="currentColor" />
        </div>
        <h3 className="text-2xl font-extrabold text-center text-gray-900">Install bookmark</h3>
        <p className="text-center text-sm text-gray-600 mt-2 max-w-[460px] mx-auto">
          Stay signed in to Memora, add Save to Memora to your browser bar, then use it on any site.
          Saved content appears in Sources with original URL.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            ref={dragLinkRef}
            draggable
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-bold border border-memora-primary bg-memora-primary/10 text-memora-dark shadow-[0_0_10px_rgba(34,197,94,0.25)] hover:bg-memora-primary hover:text-white transition-all"
          >
            <Bookmark size={14} fill="currentColor" className="shrink-0" />
            Save to Memora
          </a>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Copy size={15} />
            {copied ? "Copied bookmark URL" : "Copy bookmark URL"}
          </button>
        </div>

        <p className="text-[12px] text-gray-500 text-center mt-3">
          If drag does not work in Safari or Firefox, copy bookmark URL and paste while creating bookmark.
        </p>

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm font-bold text-gray-800 mb-2">Flow</div>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>You are signed in to Memora in this tab.</li>
            <li>Drag Save to Memora to bookmarks bar.</li>
            <li>Open ChatGPT/Claude/Gemini/Perplexity/X/Reddit/YouTube.</li>
            <li>Select content, click bookmark, source is saved in Sources.</li>
          </ol>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onInstalled}
            className="px-5 py-2.5 rounded-lg bg-memora-primary text-white text-sm font-bold hover:bg-memora-dark transition-colors"
          >
            I&apos;ve Installed It
          </button>
        </div>
      </div>
    </div>
  );
}
