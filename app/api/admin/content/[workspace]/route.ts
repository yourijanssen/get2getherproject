import { randomUUID } from "node:crypto";
import { isAdmin } from "@/lib/admin-auth";
import { getProductSql } from "@/lib/diy-products";
import { getManagedContent, type EventAvailability, type Workspace } from "@/lib/managed-content";
import { isContentImage, MAX_CONTENT_IMAGES } from "@/lib/content-images";

import { eventAlbumUrl } from "@/lib/event-album";

export const runtime = "nodejs";
type Context = { params: Promise<{ workspace: string }> };

// Requires Greek event copy while allowing the English translation to remain empty.
function validate(input: Record<string, unknown>, workspace: Workspace) {
  const fields = ["titleEn", "titleEl", "descriptionEn", "descriptionEl"] as const;
  for (const field of fields) {
    const optional = workspace === "events" && field.endsWith("En");
    if (typeof input[field] !== "string" || (!optional && !input[field].trim()) || input[field].length > (field.startsWith("title") ? 120 : 5000)) return null;
  }
  if (typeof input.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || input.slug.length > 80) return null;
  if (!Array.isArray(input.images) || input.images.length < 1 || input.images.length > MAX_CONTENT_IMAGES || !input.images.every(isContentImage)) return null;
  if (typeof input.isActive !== "boolean" || !Number.isSafeInteger(input.sortOrder)) return null;
  const albumUrl = input.albumUrl == null || input.albumUrl === "" ? "" : eventAlbumUrl(input.albumUrl);
  if (workspace === "events" && albumUrl === null) return null;
  if (workspace === "events") {
    if (typeof input.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !Number.isFinite(Date.parse(input.date)) || new Date(input.date).toISOString().slice(0, 10) !== input.date) return null;
    if (![input.startTime, input.endTime].every(time => typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time)) || String(input.endTime) <= String(input.startTime)) return null;
    for (const field of ["locationEn", "locationEl", "materialsEn", "materialsEl"] as const) {
      const optional = field.endsWith("En");
      if (typeof input[field] !== "string" || (!optional && !input[field].trim()) || input[field].length > 1000) return null;
    }
    if (!Number.isSafeInteger(input.priceCents) || Number(input.priceCents) < 0) return null;
    if (!["available", "limited", "sold_out"].includes(String(input.availability))) return null;
  }
  return {
    titleEn: String(input.titleEn).trim(), titleEl: String(input.titleEl).trim(),
    descriptionEn: String(input.descriptionEn).trim(), descriptionEl: String(input.descriptionEl).trim(),
    ...(workspace === "events" ? {
      albumUrl,
      locationEn: String(input.locationEn).trim(), locationEl: String(input.locationEl).trim(),
      priceCents: Number(input.priceCents),
      materialsEn: String(input.materialsEn).trim(), materialsEl: String(input.materialsEl).trim(),
      availability: input.availability as EventAvailability,
    } : {}),
    images: input.images, date: workspace === "events" ? input.date : "",
    startTime: workspace === "events" ? input.startTime : "", endTime: workspace === "events" ? input.endTime : "",
  };
}

// Applies authenticated creates and edits to the requested content workspace.
async function save(request: Request, context: Context, editing: boolean) {
  if (!(await isAdmin())) return Response.json({ error: "Your session expired. Sign in again." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const { workspace } = await context.params;
  if (workspace !== "events" && workspace !== "extras") return Response.json({ error: "Workspace not found" }, { status: 404 });
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object") return Response.json({ error: "Invalid content" }, { status: 400 });
  const content = validate(input, workspace);
  if (!content || (editing && (typeof input.id !== "string" || !/^[0-9a-f-]{36}$/i.test(input.id)))) return Response.json({ error: workspace === "events" ? "Check the Greek event information, title and description, slug, at least one image, date/time, and a valid http(s) photo album link. English is optional." : "Check both languages, the slug and at least one image." }, { status: 400 });
  const sql = getProductSql();
  if (!sql) return Response.json({ error: "Content database is not configured" }, { status: 503 });
  const table = workspace === "events" ? "site_events" : "site_extras";
  try {
    const id = editing ? input.id : randomUUID();
    const args = [id, input.slug, JSON.stringify(content), input.isActive, input.sortOrder];
    const rows = editing
      ? await sql.query(`UPDATE ${table} SET slug=$2, content=$3::jsonb, is_active=$4, sort_order=$5, updated_at=NOW() WHERE id=$1 RETURNING id`, args)
      : await sql.query(`INSERT INTO ${table} (id,slug,content,is_active,sort_order) VALUES ($1,$2,$3::jsonb,$4,$5) RETURNING id`, args);
    if (!rows.length) return Response.json({ error: "This record no longer exists." }, { status: 404 });
    return Response.json({ records: await getManagedContent(workspace, true) }, { status: editing ? 200 : 201 });
  } catch (error) {
    const duplicate = (error as { code?: string }).code === "23505";
    return Response.json({ error: duplicate ? "This slug is already in use. Choose another slug." : "Could not save. Please try again." }, { status: duplicate ? 409 : 500 });
  }
}

// Creates a content record.
export async function POST(request: Request, context: Context) { return save(request, context, false); }
// Updates an existing record without replacing other records.
export async function PATCH(request: Request, context: Context) { return save(request, context, true); }
