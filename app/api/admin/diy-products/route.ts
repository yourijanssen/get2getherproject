import { randomUUID } from "node:crypto";
import { isAdmin } from "@/lib/admin-auth";
import { isContentImage } from "@/lib/content-images";
import { getDiyProducts, getProductSql } from "@/lib/diy-products";

export const runtime = "nodejs";

type ProductInput = {
  id?: string;
  slug?: string;
  titleEn?: string;
  titleEl?: string;
  descriptionEn?: string;
  descriptionEl?: string;
  priceCents?: number;
  stockStatus?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

function cleanProduct(input: ProductInput) {
  const text = (value: unknown, max: number) =>
    typeof value === "string" && value.trim().length > 0 && value.trim().length <= max
      ? value.trim()
      : null;
  const slug = text(input.slug, 80);
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const titleEn = text(input.titleEn, 120);
  const titleEl = text(input.titleEl, 120);
  const descriptionEn = text(input.descriptionEn, 1000);
  const descriptionEl = text(input.descriptionEl, 1000);
  const imageUrl = input.imageUrl ? text(input.imageUrl, 500) : null;
  if (!titleEn || !titleEl || !descriptionEn || !descriptionEl || (imageUrl && !isContentImage(imageUrl))) return null;
  if (!Number.isInteger(input.priceCents) || input.priceCents! < 0 || input.priceCents! > 1000000)
    return null;
  if (!['in_stock', 'coming_soon', 'sold_out'].includes(String(input.stockStatus)))
    return null;
  return {
    slug,
    titleEn,
    titleEl,
    descriptionEn,
    descriptionEl,
    priceCents: input.priceCents!,
    stockStatus: input.stockStatus!,
    imageUrl,
    isActive: input.isActive !== false,
    sortOrder: Number.isInteger(input.sortOrder) ? input.sortOrder! : 0,
  };
}

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ products: await getDiyProducts(true) });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const product = cleanProduct(await request.json().catch(() => ({})));
  if (!product) return Response.json({ error: "Invalid product" }, { status: 400 });
  const sql = getProductSql();
  if (!sql) return Response.json({ error: "Product database is not configured" }, { status: 503 });
  try {
    const id = randomUUID();
    await sql`INSERT INTO diy_products (id, slug, title_en, title_el, description_en, description_el, price_cents, stock_status, image_url, is_active, sort_order)
      VALUES (${id}, ${product.slug}, ${product.titleEn}, ${product.titleEl}, ${product.descriptionEn}, ${product.descriptionEl}, ${product.priceCents}, ${product.stockStatus}, ${product.imageUrl}, ${product.isActive}, ${product.sortOrder})`;
    return Response.json({ id }, { status: 201 });
  } catch {
    return Response.json({ error: "Product could not be saved" }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const input = (await request.json().catch(() => ({}))) as ProductInput;
  if (typeof input.id !== "string" || !/^[0-9a-f-]{36}$/i.test(input.id))
    return Response.json({ error: "Invalid product" }, { status: 400 });
  const product = cleanProduct(input);
  if (!product) return Response.json({ error: "Invalid product" }, { status: 400 });
  const sql = getProductSql();
  if (!sql) return Response.json({ error: "Product database is not configured" }, { status: 503 });
  try {
    await sql`UPDATE diy_products SET slug = ${product.slug}, title_en = ${product.titleEn}, title_el = ${product.titleEl}, description_en = ${product.descriptionEn}, description_el = ${product.descriptionEl}, price_cents = ${product.priceCents}, stock_status = ${product.stockStatus}, image_url = ${product.imageUrl}, is_active = ${product.isActive}, sort_order = ${product.sortOrder}, updated_at = NOW() WHERE id = ${input.id}`;
    return Response.json({ saved: true });
  } catch { return Response.json({ error: "Product could not be saved" }, { status: 409 }); }
}
