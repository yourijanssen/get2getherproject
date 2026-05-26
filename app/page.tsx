import type { Metadata } from "next";
import Link from "next/link";
import { homeContent, languages, resolveLanguage } from "@/lib/language";

type HomePageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const language = resolveLanguage((await searchParams).lang);
  const content = homeContent[language];

  return {
    title: "Get2Gether",
    description: content.metaDescription,
  };
}

export default async function Home({ searchParams }: HomePageProps) {
  const language = resolveLanguage((await searchParams).lang);
  const content = homeContent[language];
  const alternateLanguage = languages[language].alternate;

  return (
    <main lang={language}>
      <nav aria-label="language">
        <Link href={`/?lang=${alternateLanguage}`}>{content.switchLabel}</Link>
      </nav>
      <h1>{content.heading}</h1>
      <p>{content.intro}</p>
    </main>
  );
}
