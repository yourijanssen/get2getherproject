import type { Language } from "@/lib/language";

const copy = {
  en: { title: "A little off the beaten path", body: "We couldn’t find this page. The link may have changed, but there are still plenty of moments to share.", home: "Back to home", events: "Explore events" },
  el: { title: "Λίγο έξω από τη διαδρομή", body: "Δεν βρήκαμε αυτή τη σελίδα. Ο σύνδεσμος μπορεί να έχει αλλάξει, αλλά υπάρχουν ακόμη πολλές στιγμές να μοιραστούμε.", home: "Επιστροφή στην αρχική", events: "Δες τις εκδηλώσεις" },
};

// Provides the same localized recovery links for missing URLs and legacy hash routes.
export function NotFoundContent({ language }: { language: Language }) {
  const t = copy[language];
  return <section className="not-found-page page-width" aria-labelledby="not-found-title">
    <p className="not-found-code" aria-label="404">404<span aria-hidden="true">✳</span></p>
    <h1 id="not-found-title">{t.title}</h1>
    <p className="not-found-description">{t.body}</p>
    <div className="not-found-actions"><a className="button" href={`/?lang=${language}`}>{t.home}</a><a className="button button-secondary" href={`/events?lang=${language}`}>{t.events}</a></div>
  </section>;
}
