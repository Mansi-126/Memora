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

export async function GET(_request, { params }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Prompt not found", 404);
  return NextResponse.json({ data });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const updates = {};
  if (typeof body.title === "string") {
    updates.title = body.title.trim().slice(0, 500) || "Untitled prompt";
  }
  if (typeof body.body === "string") {
    updates.body = body.body.slice(0, 100000);
  }
  if (typeof body.is_favorite === "boolean") {
    updates.is_favorite = body.is_favorite;
  }
  if ("folder_id" in body) {
    updates.folder_id =
      body.folder_id === null || body.folder_id === undefined || body.folder_id === ""
        ? null
        : String(body.folder_id).trim();
  }
  if (Object.keys(updates).length === 0) return jsonError("No valid update fields");

  const { data, error } = await supabase
    .from("prompts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Prompt not found", 404);
  return NextResponse.json({ data });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const { error } = await supabase.from("prompts").delete().eq("id", id).eq("user_id", user.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
