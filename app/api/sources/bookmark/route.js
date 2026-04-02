import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

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

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const sourceUrl = String(body.source_url || body.url || "").trim();
  if (!sourceUrl || (!sourceUrl.startsWith("http://") && !sourceUrl.startsWith("https://"))) {
    return jsonError("A valid source URL is required");
  }

  const row = {
    user_id: user.id,
    title: String(body.title || "Untitled bookmark").trim(),
    source_url: sourceUrl,
    folder_id: body.folder_id || null,
    source_type: "bookmark",
    platform: detectPlatform(sourceUrl),
    selected_text: String(body.selected_text || "").slice(0, 20000),
    content: String(body.content || "").slice(0, 50000),
    metadata: {
      imported_via: "bookmarklet",
      imported_at: new Date().toISOString(),
      ...(body.metadata ?? {}),
    },
  };

  const { data, error } = await supabase
    .from("sources")
    .upsert(row, { onConflict: "user_id,source_url" })
    .select("*")
    .single();
  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ data }, { status: 201 });
}

