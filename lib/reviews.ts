import { getProductSql } from "@/lib/diy-products";

export type PublicReview = { id: string; name: string; message: string; rating: number; language: "el" | "en"; created_at: string };
export type ReviewStatus = "pending" | "approved" | "rejected";

// Selects only public fields and published reviews; private contact details never reach the page.
export async function getPublicReviews(page: number) {
  const sql = getProductSql();
  if (!sql) throw new Error("Review storage is not configured");
  const summary = await sql`SELECT count(*)::int AS total, round(avg(rating), 1)::float AS average FROM site_reviews WHERE status = 'approved'`;
  const total = Number(summary[0].total);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(total / 20)));
  const rows = await sql`SELECT id, name, message, rating, language, created_at::text FROM site_reviews WHERE status = 'approved' ORDER BY created_at DESC, id DESC LIMIT 20 OFFSET ${(currentPage - 1) * 20}`;
  return { reviews: rows as PublicReview[], total, average: summary[0].average as number | null, page: currentPage };
}
