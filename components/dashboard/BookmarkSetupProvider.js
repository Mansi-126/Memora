"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BookmarkInstallModal from "@/components/dashboard/BookmarkInstallModal";

const BookmarkSetupContext = createContext(null);

const BOOKMARK_INSTALLED_KEY = "memora_bookmark_installed";

export function useBookmarkSetup() {
  const ctx = useContext(BookmarkSetupContext);
  if (!ctx) {
    throw new Error("useBookmarkSetup must be used within BookmarkSetupProvider");
  }
  return ctx;
}

export default function BookmarkSetupProvider({ children }) {
  const [user, setUser] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("first_login") !== "1") return;
    params.delete("first_login");
    const qs = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, []);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    if (window.localStorage.getItem(BOOKMARK_INSTALLED_KEY)) return;
    queueMicrotask(() => setShowInstallModal(true));
  }, [user]);

  const bookmarkletHref = useMemo(() => {
    if (typeof window === "undefined") return "#";
    const origin = window.location.origin;
    const js = [
      "(function(){try{",
      "var o='",
      origin.replace(/\\/g, "\\\\").replace(/'/g, "\\'"),
      "';",
      "var s='';try{s=window.getSelection?String(window.getSelection()):'';}catch(_e){}",
      "if(!s){var a=document.activeElement;var t=(a&&a.tagName)||'';",
      "if((t==='TEXTAREA'||t==='INPUT')&&typeof a.selectionStart==='number'&&typeof a.selectionEnd==='number'){",
      "s=String(a.value||'').slice(a.selectionStart,a.selectionEnd);}}",
      "var p={title:document.title||'Untitled source',source_url:location.href,selected_text:(s||'').slice(0,20000),content:(s||'').slice(0,20000)};",
      "var u=o+'/bookmarklet/save';",
      "var pw=340,ph=168;",
      "var left=Math.max(8,(window.screen.availWidth||1200)-pw-16);",
      "var topPos=Math.min(80,Math.max(16,window.screen.availTop||0)+16);",
      "var feat='popup=yes,width='+pw+',height='+ph+',left='+left+',top='+topPos;",
      "var win=window.open('about:blank','_blank',feat);",
      "if(win){try{win.name=JSON.stringify(p);}catch(_e2){}try{win.location.href=u;}catch(_e3){}}",
      "else{var q=encodeURIComponent(JSON.stringify(p));window.location.href=u+'?p='+q;}",
      "}catch(e){console.error(e);}})();",
    ].join("");
    return `javascript:${js}`;
  }, []);

  const copyBookmarklet = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletHref);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [bookmarkletHref]);

  const completeBookmarkInstall = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BOOKMARK_INSTALLED_KEY, "1");
    }
    setShowInstallModal(false);
  }, []);

  const openBookmarkModal = useCallback(() => setShowInstallModal(true), []);

  const closeBookmarkModal = useCallback(() => setShowInstallModal(false), []);

  const value = useMemo(
    () => ({ openBookmarkModal }),
    [openBookmarkModal]
  );

  return (
    <BookmarkSetupContext.Provider value={value}>
      {children}
      <BookmarkInstallModal
        open={showInstallModal}
        onClose={closeBookmarkModal}
        onInstalled={completeBookmarkInstall}
        bookmarkletHref={bookmarkletHref}
        onCopy={copyBookmarklet}
        copied={copied}
      />
    </BookmarkSetupContext.Provider>
  );
}
