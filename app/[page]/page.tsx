import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExperienceSite } from "@/components/experience-site";
import { resolveLanguage } from "@/lib/language";
import { getDiyProducts } from "@/lib/diy-products";
import { getManagedContent } from "@/lib/managed-content";
import { sitePages, type SitePageKey } from "@/lib/page-content";

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
  const content = sitePages[language][page as SitePageKey];

  return content ? { title: content.title, description: content.intro } : {};
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
  const content = sitePages[language][page as SitePageKey];

  if (!content) {
    notFound();
  }

  const [diyProducts, events, extras] = await Promise.all([page === "diy-kits" ? getDiyProducts() : Promise.resolve([]), getManagedContent("events"), getManagedContent("extras")]);
  return <ExperienceSite language={language} initialRoute={page} diyProducts={diyProducts} events={events} extras={extras} />;
}
