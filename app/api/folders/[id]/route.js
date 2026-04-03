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

function normalizeTags(input) {
  if (input == null) return null;
  let list = [];
  if (Array.isArray(input)) {
    list = input.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof input === "string") {
    list = input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  } else {
    return null;
  }
  return list.slice(0, 24).map((t) => t.slice(0, 48));
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("Invalid JSON body");

  const updates = {};
  if (typeof body.name === "string") {
    updates.name = body.name.trim().slice(0, 120);
    if (!updates.name) return jsonError("Name cannot be empty");
  }
  if (typeof body.is_favorite === "boolean") {
    updates.is_favorite = body.is_favorite;
  }
  if (body.tags !== undefined) {
    const tags = normalizeTags(body.tags);
    if (tags === null) return jsonError("tags must be an array of strings or a comma-separated string");
    updates.tags = tags;
  }

  if (Object.keys(updates).length === 0) return jsonError("No valid fields to update");

  const { data, error } = await supabase
    .from("folders")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ data });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const { error } = await supabase.from("folders").delete().eq("id", id).eq("user_id", user.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
