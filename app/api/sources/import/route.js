import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseUrlsFromBulkText } from "@/lib/bulk-import-urls";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const MAX_URLS_PER_REQUEST = 500;

function detectPlatform(url = "") {
  const host = String(url).toLowerCase();
  if (host.includes("chatgpt.com") || host.includes("openai.com")) return "chatgpt";
  if (host.includes("claude.ai")) return "claude";
  if (host.includes("gemini.google.com")) return "gemini";
  if (host.includes("perplexity.ai")) return "perplexity";
  if (host.includes("x.com") || host.includes("twitter.com")) return "x";
  if (host.includes("reddit.com")) return "reddit";
  if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
  return "web";
}

function titleFromUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) {
      const decoded = decodeURIComponent(last.replace(/\+/g, " "));
      const cleaned = decoded.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();
      if (cleaned.length > 2) return cleaned.slice(0, 500);
    }
    return u.hostname.replace(/^www\./i, "").slice(0, 500);
  } catch {
    return url.slice(0, 500);
  }
}

function isUniqueViolation(error) {
  if (!error) return false;
  const code = String(error.code ?? "");
  if (code === "23505") return true;
  const msg = String(error.message ?? "").toLowerCase();
  return (
    msg.includes("duplicate key") ||
    msg.includes("unique constraint") ||
    msg.includes("already exists")
  );
}

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null };
  return { supabase, user };
}

export async function POST(request) {
  const { supabase, user } = await getAuthUser();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const text = String(body.text ?? body.paste ?? "");
  const folderIdRaw = body.folder_id;
  const folderId =
    folderIdRaw === null || folderIdRaw === undefined || folderIdRaw === ""
      ? null
      : String(folderIdRaw).trim();

  const urls = parseUrlsFromBulkText(text);
  if (urls.length === 0) {
    return jsonError(
      "No valid http(s) URLs found. Paste one URL per line, separate with commas, or upload a CSV that contains links.",
      400
    );
  }

  if (urls.length > MAX_URLS_PER_REQUEST) {
    return jsonError(
      `Too many URLs (${urls.length}). Maximum per import is ${MAX_URLS_PER_REQUEST}. Split into smaller batches.`,
      400
    );
  }

  if (folderId) {
    const { data: folder, error: folderErr } = await supabase
      .from("folders")
      .select("id")
      .eq("id", folderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (folderErr) return jsonError(folderErr.message, 500);
    if (!folder) return jsonError("Collection not found", 404);
  }

  const imported = [];
  const skippedDuplicate = [];
  const failed = [];

  for (const source_url of urls) {
    const row = {
      user_id: user.id,
      title: titleFromUrl(source_url),
      source_url,
      source_type: "manual",
      platform: detectPlatform(source_url),
      folder_id: folderId,
      selected_text: "",
      content: "",
      metadata: { import: "bulk", imported_at: new Date().toISOString() },
    };

    const { data, error } = await supabase.from("sources").insert(row).select("id, source_url");

    if (error) {
      if (isUniqueViolation(error)) {
        skippedDuplicate.push(source_url);
      } else {
        failed.push({ source_url, message: error.message });
      }
      continue;
    }

    const created = Array.isArray(data) ? data[0] : data;
    if (created) imported.push(created);
  }

  return NextResponse.json({
    imported: imported.length,
    skippedDuplicate: skippedDuplicate.length,
    failed: failed.length,
    skipped_urls: skippedDuplicate.slice(0, 50),
    failures: failed.slice(0, 20),
    data: imported,
  });
}
