import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function getAuthedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null };
  return { supabase, user };
}

export async function GET(request) {
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const url = new URL(request.url);
  const folderId = url.searchParams.get("folder_id");
  const isFavorite = url.searchParams.get("is_favorite");

  let q = supabase.from("prompts").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  if (folderId) q = q.eq("folder_id", folderId);
  if (isFavorite === "true") q = q.eq("is_favorite", true);
  if (isFavorite === "false") q = q.eq("is_favorite", false);

  const { data, error } = await q;

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request) {
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const title = String(body.title ?? "Untitled prompt").trim().slice(0, 500) || "Untitled prompt";
  const promptBody = String(body.body ?? "").slice(0, 100000);
  const folderId =
    body.folder_id === null || body.folder_id === undefined || body.folder_id === ""
      ? null
      : String(body.folder_id).trim();
  const isFavorite = Boolean(body.is_favorite);

  const row = {
    user_id: user.id,
    title,
    body: promptBody,
    folder_id: folderId,
    is_favorite: isFavorite,
  };

  const { data, error } = await supabase.from("prompts").insert(row).select("*").single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ data }, { status: 201 });
}
