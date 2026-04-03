import { jsPDF } from "jspdf";

const MARGIN_MM = 14;
const TITLE_LH = 5.5;
const BODY_LH = 5;
const META_LH = 4.5;

/**
 * @param {{ notebookTitle?: string; items?: Record<string, unknown>[]; exportedAt: string }} opts
 * @returns {Blob}
 */
export function notebookSourcesToPdfBlob({ notebookTitle = "Notebook", items = [], exportedAt }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - 2 * MARGIN_MM;

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
  doc.setTextColor(0, 0, 0);
  doc.text("Memora — Sources export", MARGIN_MM, y);
  y += 7;

  doc.setFontSize(12);
  y = ensureY(y, 8);
  doc.text(String(notebookTitle), MARGIN_MM, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y = ensureY(y, 6);
  doc.text(`Exported: ${exportedAt}`, MARGIN_MM, y);
  y += 5;
  doc.text(`Sources: ${items.length}`, MARGIN_MM, y);
  y += 8;

  doc.setDrawColor(200);
  doc.line(MARGIN_MM, y, pageW - MARGIN_MM, y);
  y += 8;

  if (!items.length) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    y = ensureY(y, 8);
    doc.text("No sources to export.", MARGIN_MM, y);
    return doc.output("blob");
  }

  items.forEach((s, i) => {
    const title = `${i + 1}. ${String(s.title || "Untitled")}`;
    const url = String(s.source_url || "—");
    const metaParts = [];
    if (s.platform) metaParts.push(String(s.platform));
    if (s.source_type) metaParts.push(String(s.source_type));
    if (s.is_favorite) metaParts.push("Favorite");
    const meta = metaParts.join(" · ");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const titleLines = doc.splitTextToSize(title, maxW);
    for (const line of titleLines) {
      y = ensureY(y, TITLE_LH);
      doc.text(line, MARGIN_MM, y);
      y += TITLE_LH;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const urlLines = doc.splitTextToSize(url, maxW);
    for (const line of urlLines) {
      y = ensureY(y, BODY_LH);
      doc.setTextColor(30, 100, 200);
      doc.text(line, MARGIN_MM, y);
      y += BODY_LH;
    }
    doc.setTextColor(0, 0, 0);

    if (meta) {
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      const metaLines = doc.splitTextToSize(meta, maxW);
      for (const line of metaLines) {
        y = ensureY(y, META_LH);
        doc.text(line, MARGIN_MM, y);
        y += META_LH;
      }
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
    }

    y += 3;
    doc.setDrawColor(235);
    y = ensureY(y, 1);
    doc.line(MARGIN_MM, y, pageW - MARGIN_MM, y);
    y += 5;
  });

  return doc.output("blob");
}
