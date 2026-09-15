import type { Metadata } from "next";
import { ExperienceSite } from "@/components/experience-site";
import { homeContent, resolveLanguage } from "@/lib/language";
import { getManagedContent } from "@/lib/managed-content";

export const dynamic = "force-dynamic";

type HomePageProps = { searchParams: Promise<{ lang?: string | string[] }> };

// Generates the page description in the requested language.
export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  return {
    title: "Get2Gether",
    description:
      homeContent[resolveLanguage((await searchParams).lang)].metaDescription,
  };
}

// Resolves language on the server before rendering the interactive experience.
export default async function Home({ searchParams }: HomePageProps) {
  const [events, extras] = await Promise.all([getManagedContent("events"), getManagedContent("extras")]);
  return (
    <ExperienceSite language={resolveLanguage((await searchParams).lang)} events={events} extras={extras} />
  );
}
