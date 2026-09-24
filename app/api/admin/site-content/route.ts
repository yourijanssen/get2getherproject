import { isAdmin } from "@/lib/admin-auth";
import { getProductSql } from "@/lib/diy-products";
import { getSiteContent } from "@/lib/site-content";
import { isContentImage, MAX_CONTENT_IMAGES } from "@/lib/content-images";
import { contentSections, getSectionFields, writeContentField, type ContentSection } from "@/lib/site-content-schema";

export const runtime = "nodejs";

// Saves only approved bilingual text fields and rejects stale editor revisions.
export async function PATCH(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Your session expired. Sign in again; your draft is still here." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const raw = await request.text();
  if (raw.length > 250000) return Response.json({ error: "This section is too large." }, { status: 413 });
  let input;
  try { input = JSON.parse(raw); } catch { return Response.json({ error: "Invalid content." }, { status: 400 }); }
  if (!input || !contentSections.some(section => section.id === input.section) || !Number.isSafeInteger(input.revision)) return Response.json({ error: "Invalid section or revision." }, { status: 400 });
  const fields = getSectionFields(input.section as ContentSection);
  if (input.section === "home" && (!Array.isArray(input.heroImages) || input.heroImages.length < 1 || input.heroImages.length > MAX_CONTENT_IMAGES || !input.heroImages.every(isContentImage))) {
    return Response.json({ error: "Add between 1 and 12 valid homepage images." }, { status: 400 });
  }
  for (const language of ["el", "en"] as const) {
    const values = input.values?.[language];
    if (!values || typeof values !== "object" || Array.isArray(values) || Object.keys(values).length !== fields.length) return Response.json({ error: "Include all fields in Greek and English." }, { status: 400 });
    for (const field of fields) {
      const value = values[field.path];
      if (typeof value !== "string" || !value.trim() || value.length > (field.multiline ? 20000 : 500)) return Response.json({ error: `Check ${field.label} in ${language === "el" ? "Greek" : "English"}.` }, { status: 400 });
      if (field.url) {
        try { if (new URL(value).protocol !== "https:") throw new Error(); }
        catch { return Response.json({ error: "Resource links must be complete HTTPS URLs." }, { status: 400 }); }
      }
    }
  }
  try {
    const current = await getSiteContent();
    const content = structuredClone(current.content);
    if (input.section === "home") {
      content.el.heroImages = [...input.heroImages];
      content.en.heroImages = [...input.heroImages];
    }
    for (const language of ["el", "en"] as const) for (const field of fields) writeContentField(content[language], field.path, input.values[language][field.path].trim());
    const sql = getProductSql();
    if (!sql) return Response.json({ error: "Site content database is not configured." }, { status: 503 });
    const rows = await sql`UPDATE site_content SET content = ${JSON.stringify(content)}::jsonb, revision = revision + 1, updated_at = NOW() WHERE id = 'website' AND revision = ${input.revision} RETURNING content, revision`;
    if (!rows.length) return Response.json({ error: "Someone saved changes after you opened this editor. Copy your draft, then reload before saving." }, { status: 409 });
    return Response.json({ content: rows[0].content, revision: rows[0].revision });
  } catch {
    return Response.json({ error: "Could not save site content. Your draft is still here; please try again." }, { status: 500 });
  }
}
