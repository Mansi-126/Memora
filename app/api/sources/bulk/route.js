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

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

export async function PATCH(request) {
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const ids = normalizeIds(body.ids);
  const folderId =
    body.folder_id === null || body.folder_id === undefined || body.folder_id === ""
      ? null
      : String(body.folder_id).trim();

  if (ids.length === 0) return jsonError("No source ids provided");

  const { data, error } = await supabase
    .from("sources")
    .update({ folder_id: folderId })
    .in("id", ids)
    .eq("user_id", user.id)
    .select("id, folder_id");

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ data: data ?? [] });
}

export async function DELETE(request) {
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const ids = normalizeIds(body.ids);
  if (ids.length === 0) return jsonError("No source ids provided");

  const { data, error } = await supabase
    .from("sources")
    .delete()
    .in("id", ids)
    .eq("user_id", user.id)
    .select("id");

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ data: data ?? [] });
}

