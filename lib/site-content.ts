import { cache } from "react";
import { getProductSql } from "@/lib/diy-products";
import type { SiteContentRecord } from "@/lib/site-content-schema";

// Reads durable site copy once per server render; missing setup never silently restores code defaults.
export const getSiteContent = cache(async (): Promise<SiteContentRecord> => {
  const sql = getProductSql();
  if (!sql) throw new Error("Site content database is not configured.");
  const rows = await sql`SELECT content, revision FROM site_content WHERE id = 'website'`;
  if (!rows.length) throw new Error("Run database/sql/20260922_site_content.sql before using the site content workspace.");
  return { content: rows[0].content, revision: rows[0].revision };
});
