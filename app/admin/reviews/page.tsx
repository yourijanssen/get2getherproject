import { AdminLogin } from "@/components/admin-login";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { ReviewStars } from "@/components/review-list";
import { isAdmin } from "@/lib/admin-auth";
import { getDiyProducts, getProductSql } from "@/lib/diy-products";
import { moderateReview } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews | Get2Gether Manager" };

// Displays a paginated moderation queue without exposing contact details in public responses.
export default async function ReviewsAdmin({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  if (!(await isAdmin())) return <AdminLogin />;
  const params = await searchParams;
  const status = ["pending", "approved", "rejected"].includes(params.status || "") ? params.status! : "pending";
  const number = Number(params.page || 1);
  const page = Number.isSafeInteger(number) && number > 0 && number < 100000 ? number : 1;
  const products = await getDiyProducts(true);
  const sql = getProductSql();
  let unavailable = false;
  const rows = sql ? await sql`SELECT id, name, message, rating, language FROM site_reviews WHERE status = ${status} ORDER BY created_at DESC, id DESC LIMIT 21 OFFSET ${(page - 1) * 20}`.catch(() => { unavailable = true; return []; }) : [];
  return <AdminShell active="reviews" productCount={products.length}>
    <header className="admin-dashboard-intro"><h1>Reviews</h1><p>Approve visitor reviews to publish them. Rejected and pending reviews stay private.</p><Link href="/reviews?lang=en">View published reviews</Link></header>
    <nav className="review-pagination" aria-label="Review status">{["pending", "approved", "rejected"].map(value => <a key={value} href={`/admin/reviews?status=${value}`} aria-current={value === status ? "page" : undefined}>{value[0].toUpperCase() + value.slice(1)}</a>)}</nav>
    {unavailable || !sql ? <p role="alert">Review storage is unavailable. Apply database/sql/20260924_reviews.sql before using this workspace.</p> : <>
      {!rows.length && <p>No {status} reviews.</p>}
      <div className="published-reviews">{rows.slice(0, 20).map(review => <article className="published-review" key={review.id}>
        <h2>{review.name}</h2><ReviewStars rating={review.rating} label="out of 5" /><p lang={review.language}>{review.message}</p>
        <form action={moderateReview} className="review-pagination"><input type="hidden" name="id" value={review.id} />
          {status !== "approved" && <button className="admin-secondary-action" name="status" value="approved">Approve & publish</button>}
          {status !== "rejected" && <button className="admin-secondary-action" name="status" value="rejected">Reject</button>}
          {status === "approved" && <button className="admin-secondary-action" name="status" value="pending">Unpublish</button>}
        </form>
      </article>)}</div>
      <nav className="review-pagination" aria-label="Pagination">{page > 1 && <a href={`/admin/reviews?status=${status}&page=${page - 1}`}>Previous</a>}{rows.length > 20 && <a href={`/admin/reviews?status=${status}&page=${page + 1}`}>Next</a>}</nav>
    </>}
  </AdminShell>;
}
