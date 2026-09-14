"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/TransferNow-20260526jAAIYA6v/Logo-transparent-cropped.png";
import { homeContent, languages, type Language } from "@/lib/language";

// Renders the responsive navigation and keeps the language switch on the current view.
export function SiteHeader({
  language,
  route,
}: {
  language: Language;
  route: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const content = homeContent[language];
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
        {content.navItems.map((item) => {
          const page = item.href === "/" ? "home" : item.href.slice(1);
          const active =
            route === page || (page === "events" && route.startsWith("event/"));
          const href = `${item.href}?lang=${language}`;
          return (
            <a
              key={item.href}
              href={href}
              className={active ? "is-active" : undefined}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          );
        })}
        <a
          className="language-link"
          lang={languages[language].alternate}
          href={`/?lang=${languages[language].alternate}#${route}`}
          onClick={() => setOpen(false)}
        >
          {content.switchLabel}
        </a>
      </nav>
    </header>
  );
}
