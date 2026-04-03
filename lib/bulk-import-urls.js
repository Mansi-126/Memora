/**
 * Shared bulk-import URL parsing for the import page and POST /api/sources/import.
 */

/** Normalize to a stable href for storage and duplicate detection. */
export function canonicalizeUrl(raw) {
  let href = String(raw || "")
    .trim()
    .replace(/[.,;:!?)'"\]]+$/g, "");
  if (!href) return null;
  try {
    const u = new URL(href);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    let p = u.pathname;
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    u.pathname = p || "/";
    return u.href;
  } catch {
    return null;
  }
}

function pushCandidate(out, seen, raw) {
  const href = canonicalizeUrl(raw);
  if (!href || seen.has(href)) return;
  seen.add(href);
  out.push(href);
}

/**
 * Extract unique http(s) URLs from pasted text (lines, commas, inline links, CSV-like rows).
 */
export function parseUrlsFromBulkText(text) {
  if (!text || !String(text).trim()) return [];
  const lines = String(text).split(/\r?\n/);
  const seen = new Set();
  const out = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const matches = [...trimmed.matchAll(/https?:\/\/[^\s\],;)'"<>\]]+/gi)];
    for (const m of matches) {
      pushCandidate(out, seen, m[0]);
    }
    if (matches.length === 0) {
      const parts = trimmed.split(/[,;]\s*/);
      for (const p of parts) {
        if (/^https?:\/\//i.test(p.trim())) pushCandidate(out, seen, p.trim());
      }
    }
  }

  return out;
}

export function countNonEmptyLines(text) {
  if (!text?.trim()) return 0;
  return String(text).split(/\r?\n/).filter((l) => l.trim()).length;
}
