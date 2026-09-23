import { AdminLogin } from "@/components/admin-login";
import { SiteContentAdmin } from "@/components/site-content-admin";
import { isAdmin } from "@/lib/admin-auth";
import { getDiyProducts } from "@/lib/diy-products";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Site content | Get2Gether Manager" };

// Loads the authenticated site editor with the current persisted bilingual copy.
export default async function SiteContentPage() {
  if (!(await isAdmin())) return <AdminLogin />;
  const [record, products] = await Promise.all([getSiteContent(), getDiyProducts(true)]);
  return <SiteContentAdmin record={record} productCount={products.length} />;
}
