import { cache } from "react";
import { notFound } from "next/navigation";
import { ExperienceSite } from "@/components/experience-site";
import { getManagedContent } from "@/lib/managed-content";
import { getSiteContent } from "@/lib/site-content";
import { localizeContent } from "@/lib/content-localization";
import { resolveLanguage } from "@/lib/language";
import { pageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ page: string; slug: string }>; searchParams: Promise<{ lang?: string | string[] }> };
export const dynamic = "force-dynamic";

// Shares one published-content lookup between metadata and rendering within a request.
const getDetail = cache(async (page: string, slug: string) => {
  if (page !== "events" && page !== "extras") notFound();
  const item = (await getManagedContent(page)).find(record => record.slug === slug);
  if (!item) notFound();
  return item;
});

// Uses the actual CMS record, never the homepage description, for search and sharing.
export async function generateMetadata({ params, searchParams }: Props) {
  const { page, slug } = await params;
  const language = resolveLanguage((await searchParams).lang);
  const item = await getDetail(page, slug);
  const copy = localizeContent(item, language);
  return pageMetadata(`/${page}/${encodeURIComponent(slug)}`, language, copy.title, copy.description, item.images[0]);
}

// Renders the selected detail in the initial server HTML, including its translated heading.
export default async function DetailPage({ params, searchParams }: Props) {
  const { page, slug } = await params;
  const language = resolveLanguage((await searchParams).lang);
  const [item, site] = await Promise.all([getDetail(page, slug), getSiteContent()]);
  return <ExperienceSite language={language} initialRoute={`${page === "events" ? "event" : "extra"}/${slug}`} events={page === "events" ? [item] : []} extras={page === "extras" ? [item] : []} content={site.content[language]} />;
}
