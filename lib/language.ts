export type Language = "el" | "en";

export const languages: Record<Language, { label: string; alternate: Language }> = {
  el: {
    label: "ελληνικά",
    alternate: "en",
  },
  en: {
    label: "english",
    alternate: "el",
  },
};

export const homeContent: Record<
  Language,
  {
    metaDescription: string;
    heading: string;
    intro: string;
    switchLabel: string;
  }
> = {
  el: {
    metaDescription: "Μια βασική ιστοσελίδα Next.js.",
    heading: "Get2Gether",
    intro: "Η ιστοσελίδα Next.js είναι έτοιμη.",
    switchLabel: "english",
  },
  en: {
    metaDescription: "A basic Next.js website.",
    heading: "Get2Gether",
    intro: "Your Next.js website is ready.",
    switchLabel: "ελληνικά",
  },
};

// Resolves the active language from the URL query and falls back to Greek.
export function resolveLanguage(language: string | string[] | undefined): Language {
  return language === "en" ? "en" : "el";
}
