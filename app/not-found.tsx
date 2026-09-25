import { headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { NotFoundContent } from "@/components/not-found-content";
import { homeContent } from "@/lib/language";

export const metadata = { title: "404 | Get2Gether", robots: { index: false, follow: false } };

// Keeps missing-page recovery available even when the content database cannot be reached.
export default async function NotFound() {
  const language = (await headers()).get("x-site-language") === "en" ? "en" : "el";
  return <><SiteHeader language={language} route="404" content={homeContent[language]} /><main id="main-content"><NotFoundContent language={language} /></main><footer className="not-found-footer"><a href={`/?lang=${language}`}>Get2Gether Project</a><p>{homeContent[language].footer}</p></footer></>;
}
