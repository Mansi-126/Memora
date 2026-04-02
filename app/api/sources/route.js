import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeSourceType(value) {
  const allowed = new Set(["bookmark", "chat", "social", "video", "web", "manual"]);
  return allowed.has(value) ? value : "web";
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

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { supabase, user: null };
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await getAuthUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request) {
  const { supabase, user } = await getAuthUser();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const items = Array.isArray(body.items) ? body.items : [body];
  if (items.length === 0) return jsonError("No sources provided");

  const rows = [];
  for (const item of items) {
    const sourceUrl = String(item.source_url || item.url || "").trim();
    const title = String(item.title || "Untitled source").trim();
    const content = String(item.content || item.selected_text || "").trim();
    const sourceType = normalizeSourceType(String(item.source_type || "web"));

    if (!sourceUrl) continue;
    if (!sourceUrl.startsWith("http://") && !sourceUrl.startsWith("https://")) continue;

    rows.push({
      user_id: user.id,
      title,
      source_url: sourceUrl,
      source_type: sourceType,
      platform: item.platform || detectPlatform(sourceUrl),
      selected_text: content.slice(0, 20000),
      content: String(item.content || "").slice(0, 50000),
      metadata: item.metadata ?? {},
    });
  }

  if (rows.length === 0) return jsonError("No valid URLs found to import");

  const { data, error } = await supabase
    .from("sources")
    .insert(rows)
    .select("*");

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ data }, { status: 201 });
}

