import type { Metadata } from "next";
import { headers } from "next/headers";
import type { Language } from "@/lib/language";

// Gives each language a self-canonical URL and reciprocal language/social metadata.
export async function pageMetadata(path: string, language: Language, title: string, description: string, image?: string): Promise<Metadata> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || (await headers()).get("x-site-origin");
  if (!origin) throw new Error("Missing public request origin");
  const base = new URL(origin);
  // Preserve pagination while replacing only the language query parameter.
  const localizedUrl = (locale: Language) => {
    const url = new URL(path, base);
    url.searchParams.set("lang", locale);
    return url.href;
  };
  const canonical = localizedUrl(language);
  const pageTitle = title === "Get2Gether" ? title : `${title} | Get2Gether`;
  const images = image ? [{ url: new URL(image, base).href, alt: title }] : undefined;
  return {
    metadataBase: base,
    title: pageTitle,
    description,
    alternates: { canonical, languages: {
      el: localizedUrl("el"),
      en: localizedUrl("en"),
      "x-default": localizedUrl("el"),
    } },
    openGraph: { title: pageTitle, description, url: canonical, siteName: "Get2Gether", type: "website", locale: language === "el" ? "el_GR" : "en_GB", alternateLocale: language === "el" ? "en_GB" : "el_GR", images },
    twitter: { card: image ? "summary_large_image" : "summary", title: pageTitle, description, images: images?.map(item => item.url) },
  };
}
