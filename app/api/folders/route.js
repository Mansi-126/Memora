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

export async function GET() {
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .order("name", { ascending: true });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request) {
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const name = String(body?.name || "").trim();
  if (!name) return jsonError("Folder name is required");

  const { data, error } = await supabase
    .from("folders")
    .insert({ user_id: user.id, name: name.slice(0, 100) })
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ data }, { status: 201 });
}

