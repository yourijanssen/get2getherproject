import { AdminLogin } from "@/components/admin-login";
import { AdminShell } from "@/components/admin-shell";
import { isAdmin } from "@/lib/admin-auth";
import { getDiyProducts, getProductSql } from "@/lib/diy-products";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contacts | Get2Gether Manager", robots: { index: false, follow: false } };
type Activity = { id: string; kind: string; name: string; email: string; message: string; language: string; status: string; created_at: string; rating: number | null; details: Record<string, string> };
type Contact = { contact_key: string; email: string; names: string[]; total: number; latest: string; activities: Activity[] };

// Combines existing durable submissions by email; anonymous contacts remain separate records.
export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  if (!(await isAdmin())) return <AdminLogin />;
  const params = await searchParams;
  const q = (params.q || "").trim().slice(0, 120);
  const requested = Number(params.page || 1);
  const page = Number.isSafeInteger(requested) && requested > 0 && requested < 100000 ? requested : 1;
  const sql = getProductSql();
  let unavailable = !sql;
  const rows = sql ? await sql`
    WITH activity AS (
      SELECT id::text, 'review' AS kind, name, email, message, language, status, created_at, rating, '{}'::jsonb AS details FROM site_reviews
      UNION ALL
      SELECT id::text, inquiry_type AS kind, name, email, message, language, status, created_at, NULL::integer AS rating, details FROM site_inquiries
    ), keyed AS (
      SELECT *, CASE WHEN trim(email) <> '' THEN lower(trim(email)) ELSE kind || ':' || id END AS contact_key FROM activity
    ), contacts AS (
      SELECT contact_key, max(email) AS email, array_agg(DISTINCT name) AS names, count(*)::int AS total, max(created_at) AS latest
      FROM keyed GROUP BY contact_key
      HAVING ${q} = '' OR bool_or(strpos(lower(name || ' ' || email || ' ' || coalesce(details->>'phone', '')), lower(${q})) > 0)
      ORDER BY max(created_at) DESC, contact_key LIMIT 21 OFFSET ${(page - 1) * 20}
    )
    SELECT contacts.*, (SELECT jsonb_agg(to_jsonb(keyed) - 'contact_key' ORDER BY created_at DESC, id) FROM keyed WHERE keyed.contact_key = contacts.contact_key) AS activities
    FROM contacts ORDER BY latest DESC, contact_key
  `.catch(() => { unavailable = true; return []; }) : [];
  return <AdminShell active="contacts" productCount={(await getDiyProducts(true)).length}>
    <header className="admin-dashboard-intro"><h1>Contacts</h1><p>Contact details and complete submission history from reviews and inquiries. Matching email addresses are grouped; reviews without email remain separate.</p><p>Marketing permission: not recorded. This list is not a mailing subscription list.</p></header>
    <form method="get" className="inquiry-status-form"><label>Search name, email or phone<input name="q" defaultValue={q} maxLength={120} /></label><button className="admin-primary-action">Search</button></form>
    {unavailable ? <p role="alert">Contact storage is unavailable. Please try again later.</p> : <>
      {!rows.length && <p>No contacts found.</p>}
      <div className="inquiry-list">{(rows.slice(0, 20) as Contact[]).map(contact => <article className="inquiry-card" key={contact.contact_key}>
        <header><h2>{contact.names.join(" / ")}</h2><span>{contact.total} submission{contact.total === 1 ? "" : "s"}</span></header>
        {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : <p>No email provided</p>}
        <details><summary>View all details and history</summary>{contact.activities.map(activity => <section key={`${activity.kind}:${activity.id}`} className="contact-activity">
          <h3>{activity.kind === "review" ? "Review" : activity.kind === "private" ? "Private event inquiry" : "Workshop inquiry"}</h3>
          <p>{activity.name} · {activity.language} · {activity.status} · <time dateTime={activity.created_at}>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Athens" }).format(new Date(activity.created_at))} (Athens)</time></p>
          {activity.rating !== null && <p>Rating: {activity.rating} / 5</p>}
          <p className="inquiry-message" lang={activity.language}>{activity.message}</p>
          <dl>{Object.entries(activity.details).filter(([,value]) => value).map(([key,value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
          <a href={activity.kind === "review" ? `/admin/reviews?status=${activity.status}` : `/admin/inquiries?status=${activity.status}`}>Open {activity.kind === "review" ? "reviews" : "inquiry inbox"}</a>
        </section>)}</details>
      </article>)}</div>
      <nav className="review-pagination" aria-label="Pagination">{page > 1 && <a href={`/admin/contacts?q=${encodeURIComponent(q)}&page=${page - 1}`}>Previous</a>}{rows.length > 20 && <a href={`/admin/contacts?q=${encodeURIComponent(q)}&page=${page + 1}`}>Next</a>}</nav>
    </>}
  </AdminShell>;
}
