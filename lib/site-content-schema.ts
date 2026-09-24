import { homeContent, type Language } from "@/lib/language";
import { sitePages } from "@/lib/page-content";

export type SiteCopy = { text: typeof homeContent.en; pages: typeof sitePages.en; heroImages: string[] };
export type SiteContentDocument = Record<Language, SiteCopy>;
export type SiteContentRecord = { content: SiteContentDocument; revision: number };
export type ContentField = { path: string; label: string; multiline: boolean; url: boolean };

export const contentSections = [
  { id: "home", label: "Home page", description: "Main heading, introduction, experiences and the story section.", href: "/" },
  { id: "about", label: "About", description: "Your story and the paragraphs on the about page.", href: "/about" },
  { id: "events", label: "Events page text", description: "Page title, introduction and calendar labels.", href: "/events" },
  { id: "private", label: "Private events", description: "Introductions and calls to action for private gatherings.", href: "/#private-events" },
  { id: "diy", label: "DIY kits page text", description: "Page title and introduction.", href: "/diy-kits" },
  { id: "extras", label: "Extras page text", description: "Page heading, introduction and resource links.", href: "/extras" },
  { id: "contact", label: "Contact", description: "Contact page heading and introductory text.", href: "/contact" },
  { id: "privacy", label: "Privacy policy", description: "Page title, introduction and policy text.", href: "/privacy-policy" },
  { id: "shared", label: "Navigation & footer", description: "Shared menu labels, buttons and footer text.", href: "/" },
  { id: "forms", label: "Forms & reviews", description: "Form labels, review headings and confirmation messages.", href: "/#reviews" },
] as const;
export type ContentSection = typeof contentSections[number]["id"];

const groups: Partial<Record<ContentSection, string[]>> = {
  home: ["metaDescription", "heading", "headingAccent", "intro", "heroCta", "storyCta", "services", "servicesIntro", "serviceNames", "serviceDescriptions", "togetherTitle", "togetherBody"],
  about: ["aboutTitle", "aboutLead", "aboutParagraphs"],
  events: ["eventsTitle", "eventsIntro", "upcomingEventsTitle", "pastEventsTitle", "pastEventsIntro", "noUpcomingEvents", "calendarTitle", "calendarIntro", "calendarToday", "calendarPreviousMonth", "calendarNextMonth", "calendarDate", "calendarTime", "calendarNoEvents", "past", "back", "upcoming", "upcomingBody", "interest", "archiveNote", "notFound"],
  private: ["privateTitle", "privateIntro", "privateBody", "customTitle", "customBody", "curatedTitle", "curatedBody"],
  extras: ["linktreeTitle", "linktreeIntro", "linktreeLinks"],
  contact: ["contactTitle", "contactBody", "contactEmail", "contactPhone"],
  forms: ["reviewTitle", "reviewIntro", "reviewSubmit", "rating", "ratingUnit", "experience", "name", "email", "phone", "message", "submit", "sending", "error", "success", "reviewSuccess", "privacy", "inquiryTitle", "inquiryIntro", "date", "guests", "location", "setting", "choose", "outdoor", "indoor", "both", "budget", "activity", "food", "foodOptions", "occasion"],
};
const excluded = new Set(["workshops", "giftTitle", "giftBody", "loyaltyTitle", "loyaltyBody", "switchLabel"]);
const labels: Record<string, string> = { heading: "Main heading", headingAccent: "Main heading — second line", intro: "Introduction", metaDescription: "Search description", heroCta: "Workshop button", storyCta: "About button", href: "Link URL", body: "Body text" };

// Turns the existing content structure into named fields, retaining fixed list sizes and routes.
function fieldsFor(value: unknown, path: string, label = ""): ContentField[] {
  if (typeof value === "string") {
    if (path.startsWith("text.navItems.") && path.endsWith(".href")) return [];
    return [{ path, label, multiline: /intro|body|description|paragraph|privacy|note|success/i.test(path), url: path.endsWith(".href") }];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const name = /^\d+$/.test(key) ? `${Number(key) + 1}` : (labels[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, c => c.toUpperCase()));
    return fieldsFor(child, `${path}.${key}`, label ? `${label} · ${name}` : name);
  });
}

// Returns only fields actually used by the selected public section.
export function getSectionFields(section: ContentSection): ContentField[] {
  const used = new Set(Object.values(groups).flat());
  const keys = section === "shared" ? Object.keys(homeContent.en).filter(key => !used.has(key) && !excluded.has(key)) : groups[section] || [];
  const fields = keys.flatMap(key => fieldsFor(homeContent.en[key as keyof typeof homeContent.en], `text.${key}`, labels[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, c => c.toUpperCase())));
  const page = section === "diy" ? "diy-kits" : section === "privacy" ? "privacy-policy" : section === "extras" ? "extras" : null;
  if (page) fields.unshift(...fieldsFor(section === "extras" ? { title: sitePages.en.extras.title, intro: sitePages.en.extras.intro } : sitePages.en[page], `pages.${page}`));
  return fields;
}

// Reads a schema-approved text path without accepting arbitrary property access.
export function readContentField(copy: SiteCopy, path: string): string {
  return path.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown>)[key], copy) as string;
}

// Updates a schema-approved leaf on an independently cloned document.
export function writeContentField(copy: SiteCopy, path: string, value: string) {
  const parts = path.split(".");
  const key = parts.pop()!;
  const parent = parts.reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], copy) as Record<string, unknown>;
  parent[key] = value;
}
