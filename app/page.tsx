import type { Metadata } from "next";
import { ExperienceSite } from "@/components/experience-site";
import { homeContent, resolveLanguage } from "@/lib/language";

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
  return (
    <ExperienceSite language={resolveLanguage((await searchParams).lang)} />
  );
}
