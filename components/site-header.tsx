"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/TransferNow-20260526jAAIYA6v/Logo-transparent-cropped.png";
import type { Language } from "@/lib/language";
import type { SiteCopy } from "@/lib/site-content-schema";

// Renders the responsive navigation and keeps the language switch on the current view.
export function SiteHeader({
  language,
  route,
  content,
}: {
  language: Language;
  route: string;
  content: SiteCopy["text"];
}) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const primaryItems = content.navItems.filter(({ href }) =>
    ["/", "/events", "/diy-kits"].includes(href),
  );
  const secondaryItems = content.navItems.filter(({ href }) =>
    ["/extras", "/about", "/contact"].includes(href),
  );
  const currentPath = route === "home" ? "/" : `/${route}`;
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    // Escape returns focus to the mobile menu trigger.
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    // Prevents the page behind the expanded navigation from scrolling.
    document.body.classList.toggle("modal-open", open);
    return () => document.body.classList.remove("modal-open");
  }, [open]);
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        {content.skip}
      </a>
      <a
        className="site-logo"
        href={`/?lang=${language}#home`}
        aria-label="Get2Gether"
        onClick={() => setOpen(false)}
      >
        <Image src={logo} alt="Get2Gether Project" priority sizes="100px" />
      </a>
      <button
        ref={toggle}
        className="menu-toggle"
        type="button"
        aria-label={open ? content.close : content.menuLabel}
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? content.close : content.menu}
      </button>
      <nav
        id="site-navigation"
        className={`site-nav${open ? " is-open" : ""}`}
        aria-label={content.navigationLabel}
      >
        <div className="nav-link-list nav-primary">
          {primaryItems.map((item) => {
            const page = item.href === "/" ? "home" : item.href.slice(1);
            const active =
              route === page ||
              (page === "events" && route.startsWith("event/"));
            return (
              <a
                key={item.href}
                href={`${item.href}?lang=${language}`}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <div className="nav-link-list nav-secondary">
          {secondaryItems.map((item) => {
            const page = item.href.slice(1);
            const active = route === page;
            return (
              <a
                key={item.href}
                href={`${item.href}?lang=${language}`}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <div className="language-switch" aria-label={content.languageLabel}>
          <a
            href={`${currentPath}?lang=el${route === "home" ? "#home" : ""}`}
            className={language === "el" ? "is-active" : undefined}
            aria-current={language === "el" ? "true" : undefined}
            onClick={() => setOpen(false)}
          >
            ελ
          </a>
          <a
            href={`${currentPath}?lang=en${route === "home" ? "#home" : ""}`}
            className={language === "en" ? "is-active" : undefined}
            aria-current={language === "en" ? "true" : undefined}
            onClick={() => setOpen(false)}
          >
            en
          </a>
        </div>
      </nav>
    </header>
  );
}
