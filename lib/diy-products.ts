import { neon } from "@neondatabase/serverless";

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

type ProductRow = {
  id: string;
  slug: string;
  title_en: string;
  title_el: string;
  description_en: string;
  description_el: string;
  price_cents: number;
  stock_status: DiyProduct["stockStatus"];
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

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
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

// Creates the Neon query client only when a request needs product data.
export function getProductSql() {
  const databaseUrl = process.env.DATABASE_URL;
  return databaseUrl ? neon(databaseUrl) : null;
}

// Reads public or manager-visible DIY products from the durable Postgres database.
export async function getDiyProducts(includeInactive = false): Promise<DiyProduct[]> {
  const sql = getProductSql();
  if (!sql) return [];
  const rows = includeInactive
    ? await sql`SELECT id, slug, title_en, title_el, description_en, description_el, price_cents, stock_status, image_url, is_active, sort_order
        FROM diy_products ORDER BY sort_order, created_at DESC`
    : await sql`SELECT id, slug, title_en, title_el, description_en, description_el, price_cents, stock_status, image_url, is_active, sort_order
        FROM diy_products WHERE is_active = TRUE ORDER BY sort_order, created_at DESC`;
  return (rows as ProductRow[]).map(mapProduct);
}
