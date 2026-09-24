import type { Metadata } from "next";
import { ExperienceSite } from "@/components/experience-site";
import { resolveLanguage } from "@/lib/language";
import { getSiteContent } from "@/lib/site-content";
import { getManagedContent } from "@/lib/managed-content";
import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

type HomePageProps = { searchParams: Promise<{ lang?: string | string[] }> };

// Generates the page description in the requested language.
export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const language = resolveLanguage((await searchParams).lang);
  return pageMetadata("/", language, "Get2Gether", (await getSiteContent()).content[language].text.metaDescription);
}

// Resolves language on the server before rendering the interactive experience.
export default async function Home({ searchParams }: HomePageProps) {
  const [events, extras, site] = await Promise.all([getManagedContent("events"), getManagedContent("extras"), getSiteContent()]);
  const language = resolveLanguage((await searchParams).lang);
  return (
    <ExperienceSite language={language} events={events} extras={extras} content={site.content[language]} />
  );
}
