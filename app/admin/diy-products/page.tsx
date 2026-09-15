import { AdminLogin } from "@/components/admin-login";
import { DiyAdmin } from "@/components/diy-admin";
import { isAdmin } from "@/lib/admin-auth";
import { getDiyProducts } from "@/lib/diy-products";

export const dynamic = "force-dynamic";

// Keeps catalogue management in its own workspace instead of the dashboard.
export default async function DiyProductsAdminPage() {
  if (!(await isAdmin())) return <AdminLogin />;
  return <DiyAdmin products={await getDiyProducts(true)} />;
}
