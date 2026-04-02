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
    .from("sources")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return jsonError(error.message, 404);
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
    updates.title = body.title.trim().slice(0, 500) || "Untitled source";
  }
  if (typeof body.selected_text === "string") {
    updates.selected_text = body.selected_text.slice(0, 20000);
  }
  if (typeof body.content === "string") {
    updates.content = body.content.slice(0, 50000);
  }
  if (typeof body.is_favorite === "boolean") {
    updates.is_favorite = body.is_favorite;
  }

  if (Object.keys(updates).length === 0) return jsonError("No valid update fields");

  const { data, error } = await supabase
    .from("sources")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ data });
}

