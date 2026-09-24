"use server";

import { isAdmin } from "@/lib/admin-auth";
import { getProductSql } from "@/lib/diy-products";
import { revalidatePath } from "next/cache";

// Changes publication status only for an authenticated manager; never deletes a visitor's review.
export async function moderateReview(form: FormData) {
  if (!(await isAdmin())) throw new Error("Sign in again before moderating reviews.");
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["pending", "approved", "rejected"].includes(status)) throw new Error("Invalid review action.");
  const sql = getProductSql();
  if (!sql) throw new Error("Review storage is unavailable.");
  await sql`UPDATE site_reviews SET status = ${status} WHERE id = ${id}::uuid`;
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}
