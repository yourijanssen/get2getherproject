import { randomUUID } from "node:crypto";
import { isAdmin } from "@/lib/admin-auth";
import { getDiyProducts, openProductDatabase } from "@/lib/diy-products";

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
  if (!titleEn || !titleEl || !descriptionEn || !descriptionEl) return null;
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
  return Response.json({ products: getDiyProducts(true) });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const product = cleanProduct(await request.json().catch(() => ({})));
  if (!product) return Response.json({ error: "Invalid product" }, { status: 400 });
  const db = openProductDatabase();
  try {
    const id = randomUUID();
    db.prepare(`INSERT INTO diy_products (id, slug, title_en, title_el, description_en, description_el, price_cents, stock_status, image_url, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, product.slug, product.titleEn, product.titleEl, product.descriptionEn, product.descriptionEl, product.priceCents, product.stockStatus, product.imageUrl, Number(product.isActive), product.sortOrder);
    return Response.json({ id }, { status: 201 });
  } catch {
    return Response.json({ error: "Product could not be saved" }, { status: 409 });
  } finally { db.close(); }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const input = (await request.json().catch(() => ({}))) as ProductInput;
  if (typeof input.id !== "string" || !/^[0-9a-f-]{36}$/i.test(input.id))
    return Response.json({ error: "Invalid product" }, { status: 400 });
  const product = cleanProduct(input);
  if (!product) return Response.json({ error: "Invalid product" }, { status: 400 });
  const db = openProductDatabase();
  try {
    db.prepare(`UPDATE diy_products SET slug=?, title_en=?, title_el=?, description_en=?, description_el=?, price_cents=?, stock_status=?, image_url=?, is_active=?, sort_order=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id=?`)
      .run(product.slug, product.titleEn, product.titleEl, product.descriptionEn, product.descriptionEl, product.priceCents, product.stockStatus, product.imageUrl, Number(product.isActive), product.sortOrder, input.id);
    return Response.json({ saved: true });
  } catch { return Response.json({ error: "Product could not be saved" }, { status: 409 }); }
  finally { db.close(); }
}
