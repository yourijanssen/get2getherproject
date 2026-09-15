import { notFound } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { ContentAdmin } from "@/components/content-admin";
import { isAdmin } from "@/lib/admin-auth";
import { getDiyProducts } from "@/lib/diy-products";
import { getManagedContent } from "@/lib/managed-content";

export const dynamic = "force-dynamic";

// Loads the protected event or extras workspace and its persisted records.
export default async function WorkspacePage({ params }: { params: Promise<{ workspace: string }> }) {
  const { workspace } = await params;
  if (workspace !== "events" && workspace !== "extras") notFound();
  if (!(await isAdmin())) return <AdminLogin />;
  const [records, products] = await Promise.all([getManagedContent(workspace, true), getDiyProducts(true)]);
  return <ContentAdmin workspace={workspace} records={records} productCount={products.length} />;
}
