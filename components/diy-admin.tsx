"use client";

import { FormEvent, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import type { DiyProduct } from "@/lib/diy-products";

const blank = {
  slug: "", titleEn: "", titleEl: "", descriptionEn: "", descriptionEl: "",
  priceCents: 0, stockStatus: "in_stock", imageUrl: "", isActive: true, sortOrder: 0,
};

// Formats stored cents as a concise euro amount for the product resource table.
function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(priceCents / 100);
}

// Shows a readable availability marker for a product record.
function ProductStatus({ product }: { product: DiyProduct }) {
  const label = !product.isActive ? "Hidden" : product.stockStatus === "in_stock" ? "In stock" : product.stockStatus === "coming_soon" ? "Coming soon" : "Sold out";
  const tone = !product.isActive ? "muted" : product.stockStatus.replace("_", "-");
  return <span className={`admin-status admin-status-${tone}`}>{label}</span>;
}

// Copies an existing record into the editor while keeping nullable image data form-safe.
function formFromProduct(product: DiyProduct) {
  return { ...product, imageUrl: product.imageUrl || "" };
}

// Lets managers maintain products through a familiar resource-dashboard layout.
export function DiyAdmin({ products }: { products: DiyProduct[] }) {
  const [items, setItems] = useState(products);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const visibleCount = items.filter((item) => item.isActive).length;
  const listedItems = useMemo(() => items.filter((item) => `${item.titleEn} ${item.titleEl} ${item.slug}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  const update = (key: keyof typeof blank, value: string | number | boolean) => setForm((current) => ({ ...current, [key]: value }));

  // Creates a new record or persists edits through the protected product API.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isEditing = editingId !== null;
    setMessage(isEditing ? "Saving changes…" : "Saving product…");
    const response = await fetch("/api/admin/diy-products", { method: isEditing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(isEditing ? { ...form, id: editingId } : form) });
    if (!response.ok) { setMessage("The product could not be saved. Check all fields and the unique slug."); return; }
    if (isEditing) {
      setItems((current) => current.map((item) => item.id === editingId ? { ...form, id: editingId, imageUrl: form.imageUrl || null } as DiyProduct : item));
    } else {
      const { id } = await response.json();
      setItems((current) => [...current, { ...form, id, imageUrl: form.imageUrl || null } as DiyProduct]);
    }
    setForm(blank);
    setEditingId(null);
    setMessage(isEditing ? "Changes saved." : "Product saved.");
  }

  // Publishes or hides a product without changing its remaining details.
  async function toggle(product: DiyProduct) {
    const response = await fetch("/api/admin/diy-products", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...product, isActive: !product.isActive }) });
    if (response.ok) setItems((current) => current.map((item) => item.id === product.id ? { ...item, isActive: !item.isActive } : item));
  }

  // Opens a product in the editor so every saved field can be maintained.
  function edit(product: DiyProduct) {
    setEditingId(product.id);
    setForm(formFromProduct(product));
    setMessage("");
    window.setTimeout(() => document.querySelector("#product-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  // Returns the editor to a clean new-product state.
  function startNewProduct() {
    setEditingId(null);
    setForm(blank);
    setMessage("");
  }

  return <AdminShell active="diy-products" productCount={items.length}>
      <header className="admin-topbar"><div><p className="admin-eyebrow">Catalogue</p><h1>DIY products</h1></div><a href="#product-editor" className="admin-primary-action" onClick={startNewProduct}><span aria-hidden="true">+</span> New product</a></header>
      <section className="admin-stat-grid" aria-label="Catalogue summary"><article><span>All products</span><strong>{items.length}</strong><small>In your catalogue</small></article><article><span>Visible products</span><strong>{visibleCount}</strong><small>Shown on the DIY page</small></article><article><span>Hidden products</span><strong>{items.length - visibleCount}</strong><small>Not public yet</small></article></section>
      <section className="admin-resource-card" id="products">
        <div className="admin-resource-header"><div><h2>Products</h2><p>Manage what visitors see on the DIY kits page.</p></div><label className="admin-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" /></label></div>
        <div className="admin-table-wrap"><table className="admin-product-table"><thead><tr><th>Product</th><th>Status</th><th>Price</th><th>Sort order</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{listedItems.map((product) => <tr key={product.id}><td><strong>{product.titleEn}</strong><span>{product.titleEl} · {product.slug}</span></td><td><ProductStatus product={product} /></td><td>{formatPrice(product.priceCents)}</td><td>{product.sortOrder}</td><td><div className="admin-row-actions"><button type="button" className="admin-row-action" onClick={() => edit(product)}>Edit</button><button type="button" className="admin-row-action" onClick={() => toggle(product)}>{product.isActive ? "Hide" : "Publish"}</button></div></td></tr>)}</tbody></table></div>
        {listedItems.length === 0 && <p className="admin-empty">No products match this search.</p>}
      </section>
      <section className="admin-form-card" id="product-editor">
        <div className="admin-form-heading"><div><p className="admin-eyebrow">{editingId ? "Edit record" : "New record"}</p><h2>{editingId ? "Edit product" : "Add a product"}</h2><p>Both English and Greek details are required for the public website.</p></div></div>
        <form className="admin-product-form" onSubmit={submit}>
          <label>Slug<input value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="flower-bar-kit" required /></label>
          <div className="admin-fields"><label>English title<input value={form.titleEn} onChange={(event) => update("titleEn", event.target.value)} required /></label><label>Greek title<input value={form.titleEl} onChange={(event) => update("titleEl", event.target.value)} required /></label></div>
          <div className="admin-fields"><label>English description<textarea value={form.descriptionEn} onChange={(event) => update("descriptionEn", event.target.value)} required /></label><label>Greek description<textarea value={form.descriptionEl} onChange={(event) => update("descriptionEl", event.target.value)} required /></label></div>
          <div className="admin-fields"><label>Price in cents<input type="number" min="0" value={form.priceCents} onChange={(event) => update("priceCents", Number(event.target.value))} required /></label><label>Status<select value={form.stockStatus} onChange={(event) => update("stockStatus", event.target.value)}><option value="in_stock">In stock</option><option value="coming_soon">Coming soon</option><option value="sold_out">Sold out</option></select></label></div>
          <div className="admin-fields"><label>Sort order<input type="number" value={form.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} /></label><label className="admin-check"><input type="checkbox" checked={form.isActive} onChange={(event) => update("isActive", event.target.checked)} /> Visible on the DIY page</label></div>
          <div className="admin-form-actions"><button type="submit" className="admin-primary-action">{editingId ? "Save changes" : "Create product"}</button>{editingId && <button type="button" className="admin-secondary-action" onClick={startNewProduct}>Cancel editing</button>}{message && <p aria-live="polite">{message}</p>}</div>
        </form>
      </section>
  </AdminShell>;
}
