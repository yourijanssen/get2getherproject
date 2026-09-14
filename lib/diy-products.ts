import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

export type DiyProduct = {
  id: string;
  slug: string;
  titleEn: string;
  titleEl: string;
  descriptionEn: string;
  descriptionEl: string;
  priceCents: number;
  stockStatus: "in_stock" | "coming_soon" | "sold_out";
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

type ProductRow = Omit<DiyProduct, "titleEn" | "titleEl" | "descriptionEn" | "descriptionEl" | "priceCents" | "stockStatus" | "imageUrl" | "isActive" | "sortOrder"> & {
  title_en: string;
  title_el: string;
  description_en: string;
  description_el: string;
  price_cents: number;
  stock_status: DiyProduct["stockStatus"];
  image_url: string | null;
  is_active: number;
  sort_order: number;
};

// Resolves the durable SQLite location shared by public product reads and the admin panel.
export function databasePath() {
  return process.env.GET2GETHER_DATABASE_PATH || "./data/get2gether.sqlite";
}

function mapProduct(row: ProductRow): DiyProduct {
  return {
    id: row.id,
    slug: row.slug,
    titleEn: row.title_en,
    titleEl: row.title_el,
    descriptionEn: row.description_en,
    descriptionEl: row.description_el,
    priceCents: row.price_cents,
    stockStatus: row.stock_status,
    imageUrl: row.image_url,
    isActive: row.is_active === 1,
    sortOrder: row.sort_order,
  };
}

export function getDiyProducts(includeInactive = false): DiyProduct[] {
  const path = databasePath();
  if (!existsSync(path)) return [];
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const clause = includeInactive ? "" : "WHERE is_active = 1";
    return (
      db
        .prepare(
          `SELECT id, slug, title_en, title_el, description_en, description_el, price_cents, stock_status, image_url, is_active, sort_order
           FROM diy_products ${clause} ORDER BY sort_order, created_at DESC`,
        )
        .all() as ProductRow[]
    ).map(mapProduct);
  } catch {
    return [];
  } finally {
    db.close();
  }
}

export function openProductDatabase() {
  return new DatabaseSync(databasePath());
}
