import { AdminLogin } from "@/components/admin-login";
import { AdminShell } from "@/components/admin-shell";
import { isAdmin } from "@/lib/admin-auth";
import { getDiyProducts, getProductSql } from "@/lib/diy-products";
import { updateInquiryStatus } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inquiry inbox | Get2Gether Manager", robots: { index: false, follow: false } };
const statuses = { new: "New", in_progress: "In progress", handled: "Handled" };
const detailLabels: Record<string, string> = { topic: "Workshop / topic", phone: "Phone", date: "Preferred date", guests: "Guests", location: "Location", setting: "Setting", budget: "Budget", food: "Food & drinks", activity: "Creative activity" };
type Inquiry = { id: string; name: string; email: string; message: string; language: string; inquiry_type: string; status: keyof typeof statuses; created_at: string; details: Record<string, string> };

// Reads private requests only after authentication, with status filters and bounded pagination.
export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string; notice?: string }> }) {
  if (!(await isAdmin())) return <AdminLogin />;
  const params = await searchParams;
  const status = Object.hasOwn(statuses, params.status || "") ? params.status as keyof typeof statuses : "new";
  const requested = Number(params.page || 1);
  const page = Number.isSafeInteger(requested) && requested > 0 && requested < 100000 ? requested : 1;
  const sql = getProductSql();
  let unavailable = !sql;
  const rows = sql ? await sql`SELECT id, name, email, message, language, inquiry_type, status, created_at::text, details FROM site_inquiries WHERE status = ${status} ORDER BY created_at DESC, id DESC LIMIT 21 OFFSET ${(page - 1) * 20}`.catch(() => { unavailable = true; return []; }) : [];
  const notices: Record<string, string> = { saved: "Status updated.", changed: "This inquiry was changed by someone else. Refresh and check its current status.", unavailable: "Could not save the status. Please try again." };
  return <AdminShell active="inquiries" productCount={(await getDiyProducts(true)).length}>
    <header className="admin-dashboard-intro"><h1>Inquiry inbox</h1><p>Workshop and private event requests. Changing a status does not send a reply.</p></header>
    {params.notice && notices[params.notice] && <p role="status">{notices[params.notice]}</p>}
    <nav className="review-pagination" aria-label="Inquiry status">{Object.entries(statuses).map(([value, label]) => <a key={value} href={`/admin/inquiries?status=${value}`} aria-current={value === status ? "page" : undefined}>{label}</a>)}</nav>
    {unavailable ? <p role="alert">Inquiry storage is unavailable. Apply database/sql/20260924_inquiries.sql before using this inbox.</p> : <>
      {!rows.length && <p>No {statuses[status].toLowerCase()} inquiries.</p>}
      <div className="inquiry-list">{(rows.slice(0, 20) as Inquiry[]).map(inquiry => <article className="inquiry-card" key={inquiry.id}>
        <header><h2>{inquiry.name}</h2><span>{inquiry.inquiry_type === "private" ? "Private event" : "Workshop"} · {inquiry.language.toUpperCase()} · {statuses[inquiry.status]}</span><time dateTime={inquiry.created_at}>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Athens" }).format(new Date(inquiry.created_at))} (Athens)</time></header>
        <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
        <p lang={inquiry.language} className="inquiry-message">{inquiry.message}</p>
        <dl>{Object.entries(detailLabels).filter(([key]) => inquiry.details[key]).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{inquiry.details[key]}</dd></div>)}</dl>
        <form action={updateInquiryStatus} className="inquiry-status-form"><input type="hidden" name="id" value={inquiry.id} /><input type="hidden" name="previous" value={inquiry.status} /><label>Status<select name="status" defaultValue={inquiry.status}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="admin-primary-action" type="submit">Save status</button></form>
      </article>)}</div>
      <nav className="review-pagination" aria-label="Pagination">{page > 1 && <a href={`/admin/inquiries?status=${status}&page=${page - 1}`}>Previous</a>}{rows.length > 20 && <a href={`/admin/inquiries?status=${status}&page=${page + 1}`}>Next</a>}</nav>
    </>}
  </AdminShell>;
}
