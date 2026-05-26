"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logo from "@/assets/TransferNow-20260526jAAIYA6v/Logo-transparent.png";
import type { Language } from "@/lib/language";
import { homeContent, languages } from "@/lib/language";

type SiteHeaderProps = {
  language: Language;
};

// Renders the site header and controls the mobile navigation menu state.
export function SiteHeader({ language }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const content = homeContent[language];
  const alternateLanguage = languages[language].alternate;

  return (
    <header className="site-header">
      <Link className="site-logo" href={`/?lang=${language}`} aria-label="Get2Gether">
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
          <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
            {item.label}
          </a>
        ))}
        <Link href={`/?lang=${alternateLanguage}`} onClick={() => setIsMenuOpen(false)}>
          {content.switchLabel}
        </Link>
      </nav>
    </header>
  );
}
