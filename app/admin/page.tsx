import { DiyAdmin } from "@/components/diy-admin";
import { AdminLogin } from "@/components/admin-login";
import { isAdmin } from "@/lib/admin-auth";
import { getDiyProducts } from "@/lib/diy-products";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin />;
  return <DiyAdmin products={getDiyProducts(true)} />;
}
