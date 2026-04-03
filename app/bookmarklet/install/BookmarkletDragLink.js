"use client";

import { useEffect, useRef } from "react";
import { Leaf } from "lucide-react";
import { buildBookmarkletHref } from "@/lib/bookmarklet-href";

export default function BookmarkletDragLink({ origin, className }) {
  const ref = useRef(null);
  const href = buildBookmarkletHref(origin);

  useEffect(() => {
    if (ref.current && href.startsWith("javascript:")) {
      ref.current.setAttribute("href", href);
    }
  }, [href]);

  return (
    <a
      ref={ref}
      href="#"
      onClick={(e) => e.preventDefault()}
      draggable
      className={className}
    >
      <Leaf className="text-memora-primary shrink-0 drop-shadow-sm" size={18} strokeWidth={2.25} />
      Save to Memora
    </a>
  );
}
