import { ExperienceSite } from "@/components/experience-site";
import { ReviewList } from "@/components/review-list";
import { resolveLanguage } from "@/lib/language";
import { getSiteContent } from "@/lib/site-content";
import { getPublicReviews } from "@/lib/reviews";
import { reviewCopy } from "@/lib/review-copy";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ lang?: string | string[]; page?: string }> };

// Provides translated search metadata for the public review archive.
export async function generateMetadata({ searchParams }: Props) {
  const copy = reviewCopy[resolveLanguage((await searchParams).lang)];
  return { title: `${copy.title} | Get2Gether`, description: copy.intro };
}

// Loads approved reviews independently from private submissions and fails visibly when storage is unavailable.
export default async function ReviewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const language = resolveLanguage(params.lang);
  const requestedPage = Number(params.page || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [site, result] = await Promise.all([getSiteContent(), getPublicReviews(page).then(data => ({ ...data, unavailable: false })).catch(() => ({ reviews: [], total: 0, average: null, page: 1, unavailable: true }))]);
  return <ExperienceSite language={language} initialRoute="reviews" events={[]} extras={[]} content={site.content[language]} reviewPage={<ReviewList language={language} {...result} />} />;
}
