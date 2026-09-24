import { getProductSql } from "@/lib/diy-products";

export type Workspace = "events" | "extras";
export type ContentRecord = {
  id: string;
  slug: string;
  titleEn: string;
  titleEl: string;
  descriptionEn: string;
  descriptionEl: string;
  images: string[];
  albumUrl?: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  sortOrder: number;
};

// Reads persisted content; publication is always decided by the database.
export async function getManagedContent(workspace: Workspace, includeInactive = false): Promise<ContentRecord[]> {
  const sql = getProductSql();
  if (!sql) throw new Error("Content database is not configured");
  const table = workspace === "events" ? "site_events" : "site_extras";
  const rows = await sql.query(`SELECT id, slug, content, is_active, sort_order FROM ${table} WHERE ($1::boolean OR is_active) ORDER BY sort_order, slug`, [includeInactive]);
  return rows.map(row => ({ ...row.content, id: row.id, slug: row.slug, isActive: row.is_active, sortOrder: row.sort_order }));
}
