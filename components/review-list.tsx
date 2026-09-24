import type { Language } from "@/lib/language";
import type { PublicReview } from "@/lib/reviews";
import { reviewCopy } from "@/lib/review-copy";

// Renders accessible vector stars without device-dependent emoji glyphs.
export function ReviewStars({ rating, label }: { rating: number; label: string }) {
  return <span className="review-stars" role="img" aria-label={`${rating} ${label}`}>
    {[1, 2, 3, 4, 5].map(value => <svg key={value} viewBox="0 0 24 24" aria-hidden="true" fill={value <= rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9Z" /></svg>)}
  </span>;
}

// Shows approved visitor stories in their original language, with a truthful empty or unavailable state.
export function ReviewList({ language, reviews, total, average, page, unavailable }: { language: Language; reviews: PublicReview[]; total: number; average: number | null; page: number; unavailable: boolean }) {
  const t = reviewCopy[language];
  return <section className="page-section page-width reviews-page">
    <header className="section-heading"><div><h1>{t.title}</h1><p>{t.intro}</p></div><a className="button" href={`/?lang=${language}#reviews`}>{t.write}</a></header>
    {unavailable ? <p role="status">{t.unavailable}</p> : total === 0 ? <p>{t.empty}</p> : <>
      <div className="review-summary"><strong>{average?.toLocaleString(language === "el" ? "el-GR" : "en-GB")} / 5</strong><span>{total} {t.count.toLowerCase()}</span></div>
      <div className="published-reviews">{reviews.map(review => <article key={review.id} className="published-review">
        <ReviewStars rating={review.rating} label={t.outOf} />
        <p lang={review.language}>{review.message}</p>
        <footer><strong>{review.name}</strong><time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString(language === "el" ? "el-GR" : "en-GB", { year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Athens" })}</time></footer>
      </article>)}</div>
      {total > 20 && <nav className="review-pagination" aria-label={t.title}>{page > 1 && <a href={`/reviews?lang=${language}&page=${page - 1}`}>{t.previous}</a>}<span>{t.page} {page} / {Math.ceil(total / 20)}</span>{page * 20 < total && <a href={`/reviews?lang=${language}&page=${page + 1}`}>{t.next}</a>}</nav>}
    </>}
  </section>;
}
