"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Settings2, MoreHorizontal, Book, X, Bookmark, Copy } from "lucide-react";

function BookmarkInstallModal({
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
      // Set via DOM to avoid React's javascript: URL sanitization.
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
          <Bookmark size={18} />
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-900 transition-colors"
          >
            <Bookmark size={15} />
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

export default function DashboardHome() {
  const [copied, setCopied] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.localStorage.getItem("memora_bookmark_installed");
  });

  const bookmarkletHref = useMemo(() => {
    if (typeof window === "undefined") return "#";
    const origin = window.location.origin;
    const js = `(function(){try{var s='';try{s=window.getSelection?String(window.getSelection()):'';}catch(_e){}if(!s){var a=document.activeElement;var t=(a&&a.tagName)||'';if((t==='TEXTAREA'||t==='INPUT')&&typeof a.selectionStart==='number'&&typeof a.selectionEnd==='number'){s=String(a.value||'').slice(a.selectionStart,a.selectionEnd);}}var p={title:document.title||'Untitled source',source_url:location.href,selected_text:(s||'').slice(0,20000),content:(s||'').slice(0,20000)};var u='${origin}/bookmarklet/save';var w=window.open('about:blank','_blank','width=460,height=560');if(w){try{w.name=JSON.stringify(p);}catch(_e2){}try{w.location.href=u;}catch(_e3){}}else{var q=encodeURIComponent(JSON.stringify(p));window.location.href=u+'?p='+q;}}catch(e){console.error(e);}})();`;
    return `javascript:${js}`;
  }, []);

  async function copyBookmarklet() {
    await navigator.clipboard.writeText(bookmarkletHref);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function completeBookmarkInstall() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("memora_bookmark_installed", "1");
    }
    setShowInstallModal(false);
  }

  const notebooks = [
    { title: "Cook or Be Cooked: Removing the Human Business Bottleneck", sources: 1, type: "Standard" },
    { title: "Iris Analysis: Unlocking Human Potential", sources: 1, type: "Standard" },
    { title: "Scaling a $6M AI Children's Book Empire", sources: 1, type: "Standard" },
    { title: "Scaling Digital Products: From Startup to $141 Million", sources: 1, type: "Standard" },
    { title: "Starter Story: Profitable Micro-SaaS", sources: 9, type: "Standard" },
    { title: "The Chatbase Blueprint", sources: 5, type: "Standard" },
    { title: "The Creator Playbook for Viral App", sources: 2, type: "Research" },
    { title: "The New App Economy", sources: 2, type: "Standard" },
    { title: "Untitled", sources: 0, type: "Draft" },
  ];

  return (
    <div className="max-w-[1240px]">
      <BookmarkInstallModal
        open={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstalled={completeBookmarkInstall}
        bookmarkletHref={bookmarkletHref}
        onCopy={copyBookmarklet}
        copied={copied}
      />

      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Views</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Notebooks</span>
      </div>
      <h1 className="text-[36px] font-bold text-gray-900 tracking-tight mb-8">All Notebooks</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
         <div className="flex items-center gap-2">
            <button className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-[13px] font-bold shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 flex items-center gap-1.5">
              <span className="text-lg leading-none">+</span> New Notebook
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              <Book size={14} className="text-gray-500" /> Templates
            </button>
         </div>
         
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 text-[13px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-memora-primary min-w-[120px]">
                 <option>All Types</option>
                 <option>Standard</option>
                 <option>Research</option>
              </select>
            </div>
            <div className="relative flex-1 md:w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search notebooks..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:outline-none focus:border-memora-primary focus:bg-white transition-colors" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              <Settings2 size={14} className="text-gray-500" /> Filter
            </button>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <table className="w-full text-left text-[13px]">
            <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-200">
               <tr>
                  <th className="px-4 py-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300 text-memora-primary focus:ring-memora-primary" /></th>
                  <th className="px-4 py-3">Notebook Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Sources</th>
                  <th className="px-4 py-3 w-12 text-center"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {notebooks.map((nb, i) => (
                 <tr key={i} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                   <td className="px-4 py-4 text-center">
                     <input type="checkbox" className="rounded border-gray-300 text-memora-primary focus:ring-memora-primary" />
                   </td>
                   <td className="px-4 py-4 font-bold text-gray-900">{nb.title}</td>
                   <td className="px-4 py-4">
                     <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 border border-gray-200 text-gray-600 bg-white rounded-md">
                       {nb.type}
                     </span>
                   </td>
                   <td className="px-4 py-4 text-gray-500 font-medium text-right">{nb.sources} source{nb.sources !== 1 ? 's' : ''}</td>
                   <td className="px-4 py-4 text-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-1 hover:bg-gray-100 rounded text-gray-500"><MoreHorizontal size={16} /></button>
                   </td>
                 </tr>
               ))}
            </tbody>
         </table>
         <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50 text-xs text-gray-500 font-medium flex justify-between items-center">
           <span>0 of {notebooks.length} row(s) selected.</span>
           <div className="flex items-center gap-4">
              <span>Rows per page 10 ▾</span>
              <span>Page 1 of 1</span>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 cursor-not-allowed">{'<<'}</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 cursor-not-allowed">{'<'}</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 cursor-not-allowed">{'>'}</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 cursor-not-allowed">{'>>'}</button>
              </div>
           </div>
         </div>
      </div>
    </div>
  );
}
