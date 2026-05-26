"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import logo from "@/assets/TransferNow-20260526jAAIYA6v/Logo-transparent.png";
import type { Language } from "@/lib/language";
import { homeContent, languages } from "@/lib/language";

type SiteHeaderProps = {
  language: Language;
};

// Renders the site header and controls the mobile navigation menu state.
export function SiteHeader({ language }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const content = homeContent[language];
  const alternateLanguage = languages[language].alternate;

  useEffect(() => {
    const sectionIds = content.navItems.map((item) => item.href.replace("#", ""));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0, 0.2, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [content.navItems]);

  function closeMenuAndSetActive(sectionId: string) {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
  }

  return (
    <header className="site-header">
      <Link
        className="site-logo"
        href={`/?lang=${language}#home`}
        aria-label="Get2Gether home"
        onClick={() => closeMenuAndSetActive("home")}
      >
        <Image src={logo} alt="Get2Gether Project" priority />
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-label={content.menuLabel}
        aria-expanded={isMenuOpen}
        aria-controls="site-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="site-navigation"
        className={isMenuOpen ? "site-nav is-open" : "site-nav"}
        aria-label={content.navigationLabel}
      >
        {content.navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={activeSection === item.href.replace("#", "") ? "is-active" : undefined}
            aria-current={activeSection === item.href.replace("#", "") ? "page" : undefined}
            onClick={() => closeMenuAndSetActive(item.href.replace("#", ""))}
          >
            {item.label}
          </a>
        ))}
        <Link
          className="language-link"
          href={`/?lang=${alternateLanguage}#${activeSection}`}
          onClick={() => setIsMenuOpen(false)}
        >
          {content.switchLabel}
        </Link>
      </nav>
    </header>
  );
}
