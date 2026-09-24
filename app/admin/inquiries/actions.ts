"use server";

import { isAdmin } from "@/lib/admin-auth";
import { getProductSql } from "@/lib/diy-products";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Updates one inquiry after authentication and detects concurrent manager edits.
export async function updateInquiryStatus(form: FormData) {
  if (!(await isAdmin())) throw new Error("Sign in again before updating an inquiry.");
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  const previous = String(form.get("previous"));
  const statuses = ["new", "in_progress", "handled"];
  if (!/^[0-9a-f-]{36}$/i.test(id) || !statuses.includes(status) || !statuses.includes(previous)) throw new Error("Invalid inquiry update.");
  const sql = getProductSql();
  if (!sql) redirect("/admin/inquiries?notice=unavailable");
  let notice = "saved";
  try {
    const rows = await sql`UPDATE site_inquiries SET status = ${status}, updated_at = now() WHERE id = ${id}::uuid AND status = ${previous} RETURNING id`;
    if (!rows.length) notice = "changed";
  } catch { notice = "unavailable"; }
  revalidatePath("/admin/inquiries");
  redirect(`/admin/inquiries?status=${status}&notice=${notice}`);
}
