import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => String(v).trim()).filter(Boolean))];
}

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const targetFolderId = String(body.target_folder_id || "").trim();
  let sourceFolderIds = normalizeIds(body.source_folder_ids);

  if (!targetFolderId) return jsonError("target_folder_id is required");
  sourceFolderIds = sourceFolderIds.filter((id) => id !== targetFolderId);
  if (sourceFolderIds.length === 0) {
    return jsonError("Select at least one other folder to merge into the target");
  }

  const { data: folders, error: foldersError } = await supabase
    .from("folders")
    .select("id")
    .eq("user_id", user.id);

  if (foldersError) return jsonError(foldersError.message, 500);

  const owned = new Set((folders || []).map((f) => f.id));
  if (!owned.has(targetFolderId)) return jsonError("Target folder not found", 404);
  for (const id of sourceFolderIds) {
    if (!owned.has(id)) return jsonError("One or more folders are invalid", 400);
  }

  const { data: movedRows, error: moveError } = await supabase
    .from("sources")
    .update({ folder_id: targetFolderId })
    .in("folder_id", sourceFolderIds)
    .eq("user_id", user.id)
    .select("id");

  if (moveError) return jsonError(moveError.message, 500);

  const { error: delFoldersErr } = await supabase
    .from("folders")
    .delete()
    .in("id", sourceFolderIds)
    .eq("user_id", user.id);

  if (delFoldersErr) return jsonError(delFoldersErr.message, 500);

  return NextResponse.json({
    ok: true,
    moved: (movedRows || []).length,
    removedFolders: sourceFolderIds.length,
  });
}
