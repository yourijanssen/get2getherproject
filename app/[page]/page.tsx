import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ExperienceSite } from "@/components/experience-site";
import { resolveLanguage } from "@/lib/language";
import { getDiyProducts } from "@/lib/diy-products";
import { getManagedContent } from "@/lib/managed-content";
import { sitePages, type SitePageKey } from "@/lib/page-content";
import { getSiteContent } from "@/lib/site-content";
import { pageMetadata } from "@/lib/page-metadata";

type SitePageProps = {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

const pageKeys = Object.keys(sitePages.el) as SitePageKey[];
export const dynamic = "force-dynamic";

// Creates metadata for each localized content page.
export async function generateMetadata({
  params,
  searchParams,
}: SitePageProps): Promise<Metadata> {
  const { page } = await params;
  const language = resolveLanguage((await searchParams).lang);
  if (!pageKeys.includes(page as SitePageKey)) return {};
  const copy = (await getSiteContent()).content[language];
  const content = copy.pages[page as SitePageKey];
  const title = page === "about" ? copy.text.aboutTitle : page === "contact" ? copy.text.contactTitle : page === "events" ? copy.text.eventsTitle : content.title;
  const description = page === "about" ? copy.text.aboutLead : page === "contact" ? copy.text.contactBody : page === "events" ? copy.text.eventsIntro : content.intro;

  return pageMetadata(`/${page}`, language, title, description);
}

// Prebuilds the requested site pages for both supported languages.
export function generateStaticParams() {
  return pageKeys.map((page) => ({ page }));
}

export default async function SitePage({
  params,
  searchParams,
}: SitePageProps) {
  const { page } = await params;
  const language = resolveLanguage((await searchParams).lang);
  if (page === "private-events") redirect(`/events?lang=${language}`);
  if (!pageKeys.includes(page as SitePageKey)) {
    notFound();
  }

  const [diyProducts, events, extras, site] = await Promise.all([page === "diy-kits" ? getDiyProducts() : Promise.resolve([]), getManagedContent("events"), getManagedContent("extras"), getSiteContent()]);
  return <ExperienceSite language={language} initialRoute={page} diyProducts={diyProducts} events={events} extras={extras} content={site.content[language]} />;
}
