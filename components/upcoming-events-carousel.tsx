"use client";

import { useRef, useState, type ReactNode } from "react";
import type { Language } from "@/lib/language";

// Keeps the chronological event cards in one native, touch-scrollable row.
export function UpcomingEventsCarousel({ children, language }: { children: ReactNode[]; language: Language }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = children.length;
  const copy = language === "el"
    ? { hint: "Με σειρά ημερομηνίας · Σύρε για περισσότερα", previous: "Προηγούμενη εκδήλωση", next: "Επόμενη εκδήλωση", label: "Προσεχείς εκδηλώσεις" }
    : { hint: "In date order · Swipe to explore", previous: "Previous event", next: "Next event", label: "Upcoming events" };

  // Scrolls to a card without changing the page's vertical position or wrapping the order.
  function moveTo(index: number) {
    const node = viewport.current;
    const card = node?.children[Math.max(0, Math.min(count - 1, index))] as HTMLElement | undefined;
    if (!node || !card) return;
    node.scrollTo({ left: card.offsetLeft - (node.firstElementChild as HTMLElement).offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  // Synchronizes the counter after touch, trackpad, keyboard or arrow navigation.
  function syncPosition() {
    const node = viewport.current;
    if (!node) return;
    const first = (node.firstElementChild as HTMLElement).offsetLeft;
    let nearest = 0;
    let distance = Infinity;
    Array.from(node.children).forEach((child, index) => {
      const delta = Math.abs((child as HTMLElement).offsetLeft - first - node.scrollLeft);
      if (delta < distance) { nearest = index; distance = delta; }
    });
    setActive(nearest);
  }

  return <div className="upcoming-carousel">
    {count > 1 && <div className="upcoming-carousel-toolbar">
      <p>{copy.hint}</p>
      <div className="upcoming-carousel-controls">
        <button type="button" aria-label={copy.previous} aria-controls="upcoming-event-slides" disabled={active === 0} onClick={() => moveTo(active - 1)}>←</button>
        <span role="status" aria-live="polite" aria-atomic="true">{active + 1} / {count}</span>
        <button type="button" aria-label={copy.next} aria-controls="upcoming-event-slides" disabled={active === count - 1} onClick={() => moveTo(active + 1)}>→</button>
      </div>
    </div>}
    <div id="upcoming-event-slides" className="upcoming-events-grid" ref={viewport} onScroll={syncPosition} tabIndex={count > 1 ? 0 : undefined} role="region" aria-label={copy.label} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        moveTo(active + (event.key === "ArrowRight" ? 1 : -1));
      }
    }}>{children}</div>
  </div>;
}
