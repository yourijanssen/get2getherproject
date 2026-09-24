"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { Arrow, ExperienceForm } from "@/components/experience-form";
import type { SitePageKey } from "@/lib/page-content";
import type { Language } from "@/lib/language";
import type { SiteCopy } from "@/lib/site-content-schema";
import type { DiyProduct } from "@/lib/diy-products";
import { serviceImages } from "@/lib/workshops";
import type { ContentRecord } from "@/lib/managed-content";
import flowerArt from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 29.png";

type Modal = { topic: string; detailed: boolean } | null;
type Workshop = Omit<ContentRecord, "images"> & { images: { src: string; width: number; height: number }[] };

// Parses a date-only workshop record at noon UTC so it stays on the intended day in every timezone.
function workshopDate(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

// Formats a local calendar day without shifting it through a UTC conversion.
function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

const calendarWeekStart = 1; // Monday, using JavaScript's Sunday-zero weekday index.

// Moves one calendar month at a time, including across year boundaries and empty months.
function shiftCalendarMonth(month: string, offset: number) {
  const date = workshopDate(`${month}-01`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}

// Produces complete Monday-first calendar weeks and associates dates with their workshop record.
function calendarCells(month: string, workshops: Workshop[]) {
  const [year, monthNumber] = month.split("-").map(Number);
  const firstWeekday = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() - calendarWeekStart + 7) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, cellIndex) => {
    const day = cellIndex - firstWeekday + 1;
    if (day < 1 || day > daysInMonth) return null;

    const date = `${month}-${String(day).padStart(2, "0")}`;
    return {
      date,
      day,
      workshop: workshops.find((item) => item.date === date) as Workshop | undefined,
    };
  });
}

// Preserves shareable hash routes and browser back/forward navigation, including old section URLs.
export function ExperienceSite({
  language,
  initialRoute = "home",
  diyProducts = [],
  events,
  extras,
  content,
}: {
  language: Language;
  initialRoute?: string;
  diyProducts?: DiyProduct[];
  events: ContentRecord[];
  extras: ContentRecord[];
  content: SiteCopy;
}) {
  const t = content.text;
  const heroImages = content.heroImages;
  const workshops = events.map(item => ({ ...item, images: item.images.map(src => ({ src, width: 1080, height: 1080 })) }));
  // Selects the text belonging to the requested public language.
  function localized(item: ContentRecord) {
    return { title: language === "el" ? item.titleEl : item.titleEn, description: language === "el" ? item.descriptionEl : item.descriptionEn };
  }
  const [route, setRoute] = useState(initialRoute);
  const [slide, setSlide] = useState(0);
  const heroGesture = useRef<{ id: number; x: number; y: number } | null>(null);

  // Tracks a single touch/pen gesture without intercepting arrow clicks or page scrolling.
  function startHeroSwipe(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) { heroGesture.current = null; return; }
    if (event.pointerType === "mouse" || (event.target as Element).closest("button")) return;
    heroGesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  // Commits only deliberate horizontal swipes; short taps and vertical gestures do nothing.
  function finishHeroSwipe(event: PointerEvent<HTMLDivElement>) {
    const gesture = heroGesture.current;
    heroGesture.current = null;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    setSlide(current => (current + (dx < 0 ? 1 : -1) + heroImages.length) % heroImages.length);
  }
  const [detailSlide, setDetailSlide] = useState(0);
  const [modal, setModal] = useState<Modal>(null);
  const currentDate = localDateKey();
  const currentMonth = currentDate.slice(0, 7);
  const [agendaMonth, setAgendaMonth] = useState(currentMonth);
  const serviceRail = useRef<HTMLDivElement>(null);
  const [serviceRailPosition, setServiceRailPosition] = useState({
    atStart: true,
    atEnd: false,
  });
  const dialog = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    // Normalize historical anchor names while retaining bookmarked workshop links.
    function syncRoute() {
      const hash = window.location.hash.slice(1) || initialRoute;
      if (hash === "main-content") {
        main.current?.focus();
        return;
      }
      const aliases: Record<string, string> = {
        references: "events",
        projects: "events",
        services: "services",
      };
      const next = aliases[hash] || hash;
      setRoute(next);
      setDetailSlide(0);
      setModal(null);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, [initialRoute]);

  useEffect(() => {
    if (modal) {
      dialog.current?.showModal();
      document.body.classList.add("modal-open");
    } else {
      dialog.current?.close();
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [modal]);

  useEffect(() => {
    const title =
      route === "home"
        ? "Get2Gether"
        : route === "about"
          ? t.aboutTitle
          : route === "private-events"
            ? t.privateTitle
            : route === "contact"
              ? t.contactTitle
              : content.pages[route as SitePageKey]?.title || t.eventsTitle;
    document.title = `${title}${route === "home" ? "" : " | Get2Gether"}`;
  }, [route, t, content.pages]);

  // Keeps the service arrows in sync with the actual horizontal scroll range.
  function updateServiceRailPosition() {
    const rail = serviceRail.current;
    if (!rail) return;

    const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const nextPosition = {
      atStart: rail.scrollLeft <= 1,
      atEnd: rail.scrollLeft >= maxScrollLeft - 1,
    };
    setServiceRailPosition((position) =>
      position.atStart === nextPosition.atStart && position.atEnd === nextPosition.atEnd
        ? position
        : nextPosition,
    );
  }

  useEffect(() => {
    const rail = serviceRail.current;
    if (!rail) return;

    updateServiceRailPosition();
    rail.addEventListener("scroll", updateServiceRailPosition, { passive: true });
    const resizeObserver = new ResizeObserver(updateServiceRailPosition);
    resizeObserver.observe(rail);

    return () => {
      rail.removeEventListener("scroll", updateServiceRailPosition);
      resizeObserver.disconnect();
    };
  }, [language, route]);

  // Advances one card and clamps to the ends, revealing card four in one desktop click.
  function moveServices(direction: number) {
    const rail = serviceRail.current;
    if (rail) {
      const cardWidth = rail.firstElementChild?.getBoundingClientRect().width ?? rail.clientWidth;
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      const target = rail.scrollLeft + direction * (cardWidth + gap);
      rail.scrollTo({
        left: Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, target)),
        // Native smooth scrolling can stall when combined with mandatory scroll snapping.
        behavior: "instant",
      });
    }
  }

  const selectedIndex = workshops.findIndex(
    (item) => route === `event/${item.slug}`,
  );
  const selected = workshops[selectedIndex];
  const selectedText = selected ? localized(events[selectedIndex]) : { title: "", description: "" };
  const selectedExtra = extras.find(item => route === `extra/${item.slug}` || route === item.slug);
  const locale = language === "el" ? "el-GR" : "en-GB";
  const agendaCells = calendarCells(agendaMonth, workshops);
  const agendaTitle = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(workshopDate(`${agendaMonth}-01`));
  const weekdayLabels = Array.from({ length: 7 }, (_, day) =>
    new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(
      new Date(Date.UTC(2026, 0, 4 + calendarWeekStart + day)),
    ),
  );
  const formatWorkshopDate = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(workshopDate(date));
  const staticPage = ["diy-kits", "privacy-policy"].includes(route)
    ? content.pages[route as SitePageKey]
    : null;
  const home =
    route === "home" || route === "services" || route === "main-content";

  return (
    <>
      <SiteHeader language={language} route={route} content={t} />
      <main ref={main} id="main-content" lang={language} tabIndex={-1}>
        {home && (
          <>
            {route !== "services" && (
              <section className="hero-section page-width">
                <div className="hero-copy">
                  <h1>
                    {t.heading}
                    <em>{t.headingAccent}</em>
                  </h1>
                  <p>{t.intro}</p>
                  <div className="actions">
                    <a className="button" href={`/events?lang=${language}`}>
                      {t.heroCta}
                    </a>
                    <a
                      className="button button-outline"
                      href={`/about?lang=${language}`}
                    >
                      {t.storyCta}
                    </a>
                  </div>
                </div>
                <div className="hero-visual">
                  <span className="sunburst" aria-hidden="true">
                    ✳
                  </span>
                  <div className="hero-frame"
                    onPointerDown={startHeroSwipe}
                    onPointerUp={finishHeroSwipe}
                    onPointerCancel={() => { heroGesture.current = null; }}
                    onLostPointerCapture={() => { heroGesture.current = null; }}
                  >
                    <Image
                      src={heroImages[slide]}
                      draggable={false}
                      alt={`${t.eventsTitle} ${slide + 1}`}
                      width={1280}
                      height={1280}
                      priority
                      sizes="(max-width: 760px) 90vw, 43vw"
                    />
                    <div className="image-controls">
                      <button
                        onClick={() =>
                          setSlide(
                            (slide + heroImages.length - 1) % heroImages.length,
                          )
                        }
                        aria-label={t.previous}
                      >
                        <Arrow reverse />
                      </button>
                      <span aria-live="polite">
                        {slide + 1} / {heroImages.length}
                      </span>
                      <button
                        onClick={() =>
                          setSlide((slide + 1) % heroImages.length)
                        }
                        aria-label={t.next}
                      >
                        <Arrow />
                      </button>
                    </div>
                  </div>
                  <div className="hero-inset">
                    <Image src={serviceImages[1]} alt="" sizes="180px" />
                  </div>
                </div>
              </section>
            )}
            <section className="services-section page-width" id="services">
              <div className="section-heading">
                <div>
                  <h2>{t.services}</h2>
                  <p>{t.servicesIntro}</p>
                </div>
              </div>
              <div className="service-carousel">
                <button
                  type="button"
                  className="circle-button service-arrow service-arrow-previous"
                  onClick={() => moveServices(-1)}
                  aria-label={t.previous}
                  aria-controls="experience-cards"
                  disabled={serviceRailPosition.atStart}
                >
                  <Arrow reverse />
                </button>
                <button
                  type="button"
                  className="circle-button service-arrow service-arrow-next"
                  onClick={() => moveServices(1)}
                  aria-label={t.next}
                  aria-controls="experience-cards"
                  disabled={serviceRailPosition.atEnd}
                >
                  <Arrow />
                </button>
                <div ref={serviceRail} className="service-rail" id="experience-cards">
                  {t.serviceNames.map((name, i) => (
                    <a
                      key={name}
                      className="service-card"
                      href={`${["/events", "/contact", "/extras", "/extras"][i]}?lang=${language}`}
                    >
                      <div className="service-image">
                        <Image
                          src={serviceImages[i]}
                          alt=""
                          sizes="(max-width: 760px) 80vw, 30vw"
                        />
                      </div>
                      <div className="service-caption">
                        <div>
                          <h3>{name}</h3>
                          <p>{t.serviceDescriptions[i]}</p>
                        </div>
                        <Arrow />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>
            <section className="together-section">
              <div>
                <span className="small-star" aria-hidden="true">
                  ✳
                </span>
                <h2>{t.togetherTitle}</h2>
                <p>{t.togetherBody}</p>
                <a className="text-link" href={`/about?lang=${language}`}>
                  {t.storyCta}
                  <Arrow />
                </a>
              </div>
            </section>
            <section className="review-section page-width">
              <header>
                <h2>{t.reviewTitle}</h2>
                <p>{t.reviewIntro}</p>
              </header>
              <ExperienceForm language={language} kind="review" content={t} />
            </section>
          </>
        )}
        {route === "events" && (
          <section className="page-section page-width">
            <header className="page-heading">
              <h1>{t.eventsTitle}</h1>
              <p>{t.eventsIntro}</p>
            </header>
            <section className="agenda" aria-labelledby="agenda-heading">
              <header className="agenda-header">
                <div>
                  <span className="small-label">{t.calendarTitle}</span>
                  <h2 id="agenda-heading">{agendaTitle}</h2>
                  <p>{t.calendarIntro}</p>
                </div>
                <div className="agenda-controls">
                  <button
                    className="agenda-today"
                    type="button"
                    onClick={() => setAgendaMonth(currentMonth)}
                    disabled={agendaMonth === currentMonth}
                  >
                    {t.calendarToday}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaMonth((month) => shiftCalendarMonth(month, -1))}
                    aria-label={t.calendarPreviousMonth}
                  >
                    <Arrow reverse />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaMonth((month) => shiftCalendarMonth(month, 1))}
                    aria-label={t.calendarNextMonth}
                  >
                    <Arrow />
                  </button>
                </div>
              </header>
              <div className="agenda-scroll">
                <div className="agenda-weekdays" aria-hidden="true">
                  {weekdayLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div className="agenda-grid">
                  {agendaCells.map((cell, index) => {
                    if (!cell) {
                      return <div className="agenda-day agenda-day-empty" key={index} />;
                    }

                    const workshopIndex = workshops.findIndex(
                      (workshop) => workshop.slug === cell.workshop?.slug,
                    );
                    const workshopText = workshopIndex >= 0 ? localized(events[workshopIndex]) : { title: "" };

                    return cell.workshop ? (
                      <a
                        className={`agenda-day agenda-event${cell.date === currentDate ? " is-today" : ""}`}
                        href={`/?lang=${language}#event/${cell.workshop.slug}`}
                        key={cell.date}
                        aria-current={cell.date === currentDate ? "date" : undefined}
                        aria-label={`${formatWorkshopDate(cell.date)}: ${workshopText.title}`}
                      >
                        <time dateTime={cell.date}>{cell.day}</time>
                        <span>{workshopText.title}</span>
                        <small>
                          {cell.workshop.startTime}–{cell.workshop.endTime}
                        </small>
                      </a>
                    ) : (
                      <div
                        className={`agenda-day${cell.date === currentDate ? " is-today" : ""}`}
                        key={cell.date}
                        aria-current={cell.date === currentDate ? "date" : undefined}
                      >
                        <time dateTime={cell.date}>{cell.day}</time>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
            <div className="workshop-grid">
              {workshops.map((workshop, i) => (
                <article className="workshop-card" key={workshop.slug}>
                  <a
                    href={`/?lang=${language}#event/${workshop.slug}`}
                    className="workshop-image"
                  >
                    <Image
                      src={workshop.images[0]}
                      alt={localized(events[i]).title}
                      sizes="(max-width: 760px) 90vw, 30vw"
                    />
                  </a>
                  <div className="workshop-copy">
                    <span className="small-label">{workshop.date < currentDate ? t.past : (language === "el" ? "Προσεχής εκδήλωση" : "Upcoming event")}</span>
                    <h2>{localized(events[i]).title}</h2>
                    <a
                      className="text-link"
                      href={`/?lang=${language}#event/${workshop.slug}`}
                    >
                      {t.details}
                      <Arrow />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <div className="announcement">
              <div>
                <h2>{t.upcoming}</h2>
                <p>{t.upcomingBody}</p>
              </div>
              <button
                className="button"
                onClick={() =>
                  setModal({ topic: t.eventsTitle, detailed: false })
                }
              >
                {t.interest}
                <Arrow />
              </button>
            </div>
          </section>
        )}
        {selected && (
          <section className="page-section page-width">
            <a
              className="text-link back-link"
              href={`/?lang=${language}#events`}
            >
              <Arrow reverse />
              {t.back}
            </a>
            <div className="event-detail">
              <div className="detail-gallery">
                <Image
                  src={selected.images[detailSlide]}
                  alt={selectedText.title}
                  sizes="(max-width: 760px) 90vw, 50vw"
                  priority
                />
                {selected.images.length > 1 && (
                  <div className="gallery-thumbnails">
                    {selected.images.map((img, i) => (
                      <button
                        key={img.src}
                        aria-label={`${t.image} ${i + 1}`}
                        aria-pressed={i === detailSlide}
                        onClick={() => setDetailSlide(i)}
                      >
                        <Image src={img} alt="" sizes="80px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="detail-copy">
                <span className="small-label">{selected.date < currentDate ? t.past : (language === "el" ? "Προσεχής εκδήλωση" : "Upcoming event")}</span>
                <h1>{selectedText.title}</h1>
                <p>{selectedText.description}</p>
                <dl className="event-meta">
                  <div>
                    <dt>{t.calendarDate}</dt>
                    <dd>{formatWorkshopDate(selected.date)}</dd>
                  </div>
                  <div>
                    <dt>{t.calendarTime}</dt>
                    <dd>
                      {selected.startTime}–{selected.endTime}
                    </dd>
                  </div>
                </dl>
                <div className="booking-panel">
                  <p>{selected.date < currentDate ? t.archiveNote : (language === "el" ? "Δήλωσε το ενδιαφέρον σου για αυτή την εκδήλωση. Θα επικοινωνήσουμε μαζί σου για τη διαθεσιμότητα." : "Register your interest in this event. We will contact you about availability.")}</p>
                  <button
                    className="button"
                    onClick={() =>
                      setModal({ topic: selectedText.title, detailed: false })
                    }
                  >
                    {t.interest}
                    <Arrow />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
        {route === "private-events" && (
          <section className="page-section page-width">
            <header className="page-heading">
              <span className="small-star" aria-hidden="true">
                ✳
              </span>
              <h1>{t.privateTitle}</h1>
              <p className="lead">{t.privateIntro}</p>
              <p>{t.privateBody}</p>
            </header>
            <div className="private-grid">
              <article>
                <Image
                  src={serviceImages[1]}
                  alt=""
                  sizes="(max-width: 760px) 90vw, 45vw"
                />
                <div>
                  <h2>{t.customTitle}</h2>
                  <p>{t.customBody}</p>
                  <button
                    className="button"
                    onClick={() => setModal({ topic: "", detailed: true })}
                  >
                    {t.inquire}
                    <Arrow />
                  </button>
                </div>
              </article>
              <article>
                <Image
                  src={serviceImages[0]}
                  alt=""
                  sizes="(max-width: 760px) 90vw, 45vw"
                />
                <div>
                  <h2>{t.curatedTitle}</h2>
                  <p>{t.curatedBody}</p>
                  <a
                    href={`/events?lang=${language}`}
                    className="button button-outline"
                  >
                    {t.heroCta}
                    <Arrow />
                  </a>
                </div>
              </article>
            </div>
          </section>
        )}
        {route === "about" && (
          <section className="about-section page-width">
            <header className="page-heading">
              <h1>{t.aboutTitle}</h1>
            </header>
            <div className="about-grid">
              <div className="about-art">
                <Image
                  src={flowerArt}
                  alt=""
                  sizes="(max-width: 760px) 85vw, 35vw"
                />
              </div>
              <div>
                <h2>{t.aboutLead}</h2>
                {t.aboutParagraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                <a className="button" href={`/events?lang=${language}`}>
                  {t.heroCta}
                  <Arrow />
                </a>
              </div>
            </div>
          </section>
        )}
        {route === "contact" && (
          <section className="contact-simple page-width">
            <header className="contact-simple-intro">
              <p className="contact-simple-kicker">Get2Gether Project</p>
              <h1>{t.contactTitle}</h1>
              <p>{t.contactBody}</p>
            </header>
            <div className="contact-simple-grid">
              <a className="contact-simple-card" href="mailto:get2getherproject@gmail.com">
                <span>{t.contactEmail}</span>
                <strong>get2getherproject@gmail.com</strong>
              </a>
              <a className="contact-simple-card" href="tel:+306982151046">
                <span>{t.contactPhone}</span>
                <strong>+30 698 215 1046</strong>
              </a>
              <div className="contact-simple-card contact-simple-social">
                <span>{t.followUs}</span>
                <div>
                  <a
                    href="https://www.instagram.com/get2getherproject/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t.instagramLabel}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
                    </svg>
                    <span>Instagram</span>
                  </a>
                  <a
                    href="https://www.tiktok.com/@get2getherproject"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Get2Gether Project on TikTok"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M16.6 5.1a5.8 5.8 0 0 1-3.5-3.5h-3v12.1a2.7 2.7 0 1 1-2-2.6V8.1a5.7 5.7 0 1 0 5 5.6V7.6a8.8 8.8 0 0 0 5.2 1.7v-3a5.8 5.8 0 0 1-1.7-1.2Z" />
                    </svg>
                    <span>TikTok</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}
        {selectedExtra && (
          <section className="page-section page-width">
            <div className="event-detail">
              <Image
                className="card-art"
                src={selectedExtra.images[0]}
                width={1080}
                height={1080}
                alt={localized(selectedExtra).title}
                sizes="(max-width: 760px) 90vw, 45vw"
              />
              <div className="detail-copy">
                <h1>{localized(selectedExtra).title}</h1>
                <p>{localized(selectedExtra).description}</p>
                <button
                  className="button"
                  onClick={() =>
                    setModal({
                      topic: localized(selectedExtra).title,
                      detailed: false,
                    })
                  }
                >
                  {t.inquire}
                  <Arrow />
                </button>
              </div>
            </div>
          </section>
        )}
        {staticPage && (
          <section className="page-section page-width">
            <header className="page-heading">
              <h1>{staticPage.title}</h1>
              <p>{staticPage.intro}</p>
            </header>
            <div className="static-page-body">
              <p>{staticPage.body}</p>
              {route === "diy-kits" && diyProducts.length > 0 && <div className="diy-product-grid">{diyProducts.map((product) => <article className="diy-product-card" key={product.id}><span>{product.stockStatus === "in_stock" ? (language === "el" ? "Διαθέσιμο" : "In stock") : language === "el" ? "Σύντομα διαθέσιμο" : "Coming soon"}</span><h2>{language === "el" ? product.titleEl : product.titleEn}</h2><p>{language === "el" ? product.descriptionEl : product.descriptionEn}</p><strong>€{(product.priceCents / 100).toFixed(2)}</strong></article>)}</div>}
            </div>
          </section>
        )}
        {route === "extras" && (
          <section className="page-section page-width">
            <header className="page-heading">
              <h1>{content.pages.extras.title}</h1>
              <p>{content.pages.extras.intro}</p>
            </header>
            <div className="private-grid">
              {extras.map((extra) => (
                <article key={extra.id}>
                  <Image
                    src={extra.images[0]}
                    width={1080}
                    height={1080}
                    alt={localized(extra).title}
                    sizes="(max-width: 760px) 90vw, 45vw"
                  />
                  <div>
                    <h2>{localized(extra).title}</h2>
                    <p>{localized(extra).description}</p>
                    <a
                      className="button"
                      href={`/?lang=${language}#extra/${extra.slug}`}
                    >
                      {t.details}
                      <Arrow />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <section className="linktree-section">
              <header className="section-heading">
                <h2>{t.linktreeTitle}</h2>
                <p>{t.linktreeIntro}</p>
              </header>
              <div className="linktree-grid">
                {t.linktreeLinks.map((link) => (
                  <a
                    className="linktree-card"
                    href={link.href}
                    key={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div>
                      <h3>{link.title}</h3>
                      <p>{link.description}</p>
                    </div>
                    <Arrow />
                  </a>
                ))}
              </div>
            </section>
          </section>
        )}
        {!home &&
          !selected &&
          !selectedExtra &&
          !staticPage &&
          route !== "extras" &&
          ![
            "events",
            "private-events",
            "about",
            "contact",
          ].includes(route) && (
            <section className="page-section page-width">
              <h1>{t.notFound}</h1>
              <a href={`/events?lang=${language}`} className="button">
                {t.back}
              </a>
            </section>
          )}
      </main>
      <footer className="site-footer">
        <div className="footer-content">
          <section className="footer-identity" aria-label="Get2Gether">
          <a className="footer-brand" href={`/?lang=${language}#home`}>
            Get2Gether
          </a>
          <p>{t.footer}</p>
          <div className="contact-links footer-contact-links">
            <a href="mailto:get2getherproject@gmail.com">
              <span>{t.contactEmail}</span>
              get2getherproject@gmail.com
            </a>
            <a href="tel:+306982151046">
              <span>{t.contactPhone}</span>
              +30 698 215 1046
            </a>
          </div>
          </section>
          <nav className="footer-navigation" aria-label={t.navigationLabel}>
          {t.navItems.map((item) => (
            <a href={`${item.href}?lang=${language}`} key={item.href}>
              {item.label}
            </a>
          ))}
          </nav>
          <section className="footer-socials" aria-label={t.followUs}>
          <span>{t.followUs}</span>
          <div className="footer-social-links">
            <a
              href="https://www.instagram.com/get2getherproject/"
              target="_blank"
              rel="noreferrer"
              aria-label={t.instagramLabel}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
              </svg>
              <span>Instagram</span>
            </a>
            <a
              href="https://www.tiktok.com/@get2getherproject"
              target="_blank"
              rel="noreferrer"
              aria-label="Get2Gether Project on TikTok"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16.6 5.1a5.8 5.8 0 0 1-3.5-3.5h-3v12.1a2.7 2.7 0 1 1-2-2.6V8.1a5.7 5.7 0 1 0 5 5.6V7.6a8.8 8.8 0 0 0 5.2 1.7v-3a5.8 5.8 0 0 1-1.7-1.2Z" />
              </svg>
              <span>TikTok</span>
            </a>
          </div>
          </section>
        </div>
        <div className="footer-bottom">
          <small>
            © {new Date().getFullYear()} Get2Gether Project. {t.rights}
          </small>
          <span className="footer-developer">
            {language === "el" ? "Ανάπτυξη από" : "Developed by"}{" "}
            <a href="https://yourijanssen.nl" target="_blank" rel="noopener noreferrer">Youri Janssen</a>
          </span>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className="inquiry-dialog"
        aria-labelledby="inquiry-title"
        onCancel={() => setModal(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setModal(null);
        }}
      >
        {modal && (
          <div className="dialog-content">
            <button
              className="dialog-close circle-button"
              aria-label={t.close}
              onClick={() => setModal(null)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M6 18 18 6" />
              </svg>
            </button>
            <h2 id="inquiry-title">{t.inquiryTitle}</h2>
            <p>{t.inquiryIntro}</p>
            <ExperienceForm
              language={language}
              content={t}
              kind="inquiry"
              topic={modal.topic}
              detailed={modal.detailed}
            />
          </div>
        )}
      </dialog>
    </>
  );
}
