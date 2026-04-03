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

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const updates = {};
  if (typeof body.name === "string") {
    updates.name = body.name.trim().slice(0, 120);
    if (!updates.name) return jsonError("Name cannot be empty");
  }
  if (Object.keys(updates).length === 0) return jsonError("No valid fields");

  const { data, error } = await supabase
    .from("prompt_folders")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Folder not found", 404);
  return NextResponse.json({ data });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const { error } = await supabase.from("prompt_folders").delete().eq("id", id).eq("user_id", user.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
