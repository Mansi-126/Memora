import { jsPDF } from "jspdf";

const MARGIN_MM = 14;

/**
 * @param {{ promptFolders?: { id: string; name: string }[]; prompts?: Record<string, unknown>[]; exportedAt: string }} opts
 * @returns {Blob}
 */
export function promptsBackupToPdfBlob({ promptFolders = [], prompts = [], exportedAt }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - 2 * MARGIN_MM;

  const folderNameById = new Map((promptFolders || []).map((f) => [f.id, f.name]));

  const byFolder = new Map();
  for (const p of prompts || []) {
    const key = p.folder_id ? String(p.folder_id) : "__none__";
    if (!byFolder.has(key)) byFolder.set(key, []);
    byFolder.get(key).push(p);
  }

  const keys = [...byFolder.keys()];
  keys.sort((a, b) => {
    if (a === "__none__") return 1;
    if (b === "__none__") return -1;
    const na = folderNameById.get(a) || "";
    const nb = folderNameById.get(b) || "";
    return String(na).localeCompare(String(nb));
  });

  function ensureY(y, needMm) {
    if (y + needMm > pageH - MARGIN_MM) {
      doc.addPage();
      return MARGIN_MM;
    }
    return y;
  }

  let y = MARGIN_MM;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  y = ensureY(y, 12);
  doc.text("Memora — Prompts backup", MARGIN_MM, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y = ensureY(y, 8);
  doc.text(`Exported: ${exportedAt}`, MARGIN_MM, y);
  y += 6;

  const folderCount = (promptFolders || []).length;
  const promptCount = (prompts || []).length;
  y = ensureY(y, 8);
  doc.text(`Folders: ${folderCount} · Prompts: ${promptCount}`, MARGIN_MM, y);
  y += 8;

  doc.setDrawColor(200);
  doc.line(MARGIN_MM, y, pageW - MARGIN_MM, y);
  y += 10;

  if (promptCount === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    y = ensureY(y, 8);
    doc.text("No prompts to export.", MARGIN_MM, y);
    return doc.output("blob");
  }

  const BODY_LH = 5;
  const TITLE_LH = 5.5;

  for (const fid of keys) {
    const list = (byFolder.get(fid) || []).slice().sort((a, b) => String(a.title).localeCompare(String(b.title)));
    const sectionTitle =
      fid === "__none__" ? "No folder" : folderNameById.get(fid) || "Folder";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    y = ensureY(y, 10);
    doc.text(sectionTitle, MARGIN_MM, y);
    y += 8;

    for (const p of list) {
      const title = String(p.title || "Untitled");
      const body = String(p.body ?? "");
      const fav = p.is_favorite ? " ★" : "";

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const titleLines = doc.splitTextToSize(title + fav, maxW);
      for (const tl of titleLines) {
        y = ensureY(y, TITLE_LH);
        doc.text(tl, MARGIN_MM, y);
        y += TITLE_LH;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const bodyLines = doc.splitTextToSize(body.length ? body : "—", maxW);
      for (const bl of bodyLines) {
        y = ensureY(y, BODY_LH);
        doc.text(bl, MARGIN_MM, y);
        y += BODY_LH;
      }

      y += 3;
      doc.setDrawColor(235);
      y = ensureY(y, 2);
      doc.line(MARGIN_MM, y, pageW - MARGIN_MM, y);
      y += 5;
    }

    y += 4;
  }

  return doc.output("blob");
}
