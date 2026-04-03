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

// Bulk folder operations for the dashboard UI.
export async function DELETE(request) {
  const { supabase, user } = await getAuthedClient();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => ({}));
  const mode = String(body?.mode || "all");
  const ids = normalizeIds(body?.ids);

  // Safety: require either mode=all or explicit ids.
  if (mode !== "all" && ids.length === 0) return jsonError("Missing folders to delete");

  let deletedFolders = [];
  try {
    if (mode === "all") {
      const { data, error } = await supabase
        .from("folders")
        .delete()
        .eq("user_id", user.id)
        .select("id");

      if (error) return jsonError(error.message, 500);
      deletedFolders = data ?? [];
    } else {
      const { data, error } = await supabase
        .from("folders")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id)
        .select("id");

      if (error) return jsonError(error.message, 500);
      deletedFolders = data ?? [];
    }
  } catch (e) {
    return jsonError(e?.message || "Failed to delete folders", 500);
  }

  // Note: sources.folder_id is FK'ed with `on delete set null`,
  // so sources remain but become unassigned from deleted folders.
  return NextResponse.json(
    { data: { folders_deleted: deletedFolders.length } },
    { status: 200 }
  );
}

