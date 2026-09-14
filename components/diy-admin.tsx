"use client";

import { FormEvent, useState } from "react";
import type { DiyProduct } from "@/lib/diy-products";

const blank = {
  slug: "", titleEn: "", titleEl: "", descriptionEn: "", descriptionEl: "",
  priceCents: 0, stockStatus: "in_stock", imageUrl: "", isActive: true, sortOrder: 0,
};

// Lets managers add products without exposing write controls on the public DIY page.
export function DiyAdmin({ products }: { products: DiyProduct[] }) {
  const [items, setItems] = useState(products);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");
  const update = (key: keyof typeof blank, value: string | number | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("Saving…");
    const response = await fetch("/api/admin/diy-products", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    if (!response.ok) { setMessage("The product could not be saved. Check all fields and the unique slug."); return; }
    const { id } = await response.json();
    setItems((current) => [...current, { ...form, id, imageUrl: form.imageUrl || null } as DiyProduct]);
    setForm(blank); setMessage("Product saved.");
  }
  async function toggle(product: DiyProduct) {
    const response = await fetch("/api/admin/diy-products", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...product, isActive: !product.isActive }) });
    if (response.ok) setItems((current) => current.map((item) => item.id === product.id ? { ...item, isActive: !item.isActive } : item));
  }
  return <main className="admin-page"><header><p>Get2Gether manager</p><h1>DIY products</h1><span>{items.length} products in the catalogue</span></header><section className="admin-grid"><form className="admin-product-form" onSubmit={submit}><h2>Add a product</h2><label>Slug<input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="flower-bar-kit" required /></label><div className="admin-fields"><label>English title<input value={form.titleEn} onChange={(e) => update("titleEn", e.target.value)} required /></label><label>Greek title<input value={form.titleEl} onChange={(e) => update("titleEl", e.target.value)} required /></label></div><div className="admin-fields"><label>English description<textarea value={form.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} required /></label><label>Greek description<textarea value={form.descriptionEl} onChange={(e) => update("descriptionEl", e.target.value)} required /></label></div><div className="admin-fields"><label>Price in cents<input type="number" min="0" value={form.priceCents} onChange={(e) => update("priceCents", Number(e.target.value))} required /></label><label>Status<select value={form.stockStatus} onChange={(e) => update("stockStatus", e.target.value)}><option value="in_stock">In stock</option><option value="coming_soon">Coming soon</option><option value="sold_out">Sold out</option></select></label></div><label className="admin-check"><input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} /> Visible on the DIY page</label><button type="submit">Save product</button>{message && <p aria-live="polite">{message}</p>}</form><section className="admin-products"><h2>Catalogue</h2>{items.map((product) => <article key={product.id}><div><strong>{product.titleEn}</strong><span>{product.slug} · €{(product.priceCents / 100).toFixed(2)}</span></div><button type="button" onClick={() => toggle(product)}>{product.isActive ? "Hide" : "Publish"}</button></article>)}</section></section></main>;
}
