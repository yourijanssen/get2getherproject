"use client";

import { useState, type FormEvent } from "react";
import { AdminShell } from "@/components/admin-shell";
import { ContentImageUploader } from "@/components/content-image-uploader";
import type { ContentRecord, Workspace } from "@/lib/managed-content";

// Creates an unpublished editor draft; it is only persisted when the manager saves.
function emptyRecord(): ContentRecord {
  return { id: "", slug: "", titleEn: "", titleEl: "", descriptionEn: "", descriptionEl: "", images: [], date: "", startTime: "18:00", endTime: "20:00", isActive: false, sortOrder: 0 };
}

// Manages bilingual events and extras through their authenticated persistence API.
export function ContentAdmin({ workspace, records, productCount }: { workspace: Workspace; records: ContentRecord[]; productCount: number }) {
  const [items, setItems] = useState(records);
  const [draft, setDraft] = useState<ContentRecord | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const locked = busy || uploading;
  const event = workspace === "events";
  const title = event ? "Events" : "Extras";

  // Updates one draft field without altering the saved record.
  function update(key: keyof ContentRecord, value: string | string[] | number | boolean) {
    setDraft(current => current ? { ...current, [key]: value } : null);
  }

  // Opens a populated editor or a new unpublished draft.
  function open(record: ContentRecord) { setDraft(record); setMessage(""); }

  // Saves the record and uses the returned database rows as the current catalogue.
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft || locked) return;
    if (!draft.images.length) { setMessage("Add at least one image before saving."); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/content/${workspace}`, { method: draft.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || "Could not save. Please try again."); return; }
      setItems(data.records); setDraft(null); setMessage("Changes saved.");
    } catch { setMessage("Connection failed. Your changes are still in the editor; please try again."); }
    finally { setBusy(false); }
  }

  return <AdminShell active={workspace} productCount={productCount}>
    <header className="admin-topbar"><div><p className="admin-eyebrow">Workspace</p><h1>{title}</h1></div><button className="admin-primary-action" disabled={locked} onClick={() => open(emptyRecord())}>+ {event ? "New event" : "New extra"}</button></header>
    <p role="status" className="admin-feedback">{message}</p>
    {draft ? <section className="admin-form-card">
      <div className="admin-form-heading"><h2>{draft.id ? "Edit" : "Add"} {event ? "event" : "extra"}</h2><p>English and Greek content appears on the corresponding public pages.</p></div>
      <form className="admin-product-form" onSubmit={submit}>
        <fieldset disabled={locked} className="admin-editor-fields">
          <label>Slug<input required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug} onChange={e => update("slug", e.target.value)} /></label>
          <div className="admin-fields">{(["En", "El"] as const).map(lang => <label key={lang}>{lang === "En" ? "English" : "Greek"} title<input required maxLength={120} value={draft[`title${lang}`]} onChange={e => update(`title${lang}`, e.target.value)} /></label>)}</div>
          <div className="admin-fields">{(["En", "El"] as const).map(lang => <label key={lang}>{lang === "En" ? "English" : "Greek"} description<textarea required maxLength={5000} value={draft[`description${lang}`]} onChange={e => update(`description${lang}`, e.target.value)} /></label>)}</div>
          {event && <><label>Date<input required type="date" value={draft.date} onChange={e => update("date", e.target.value)} /></label><div className="admin-fields"><label>Start time<input required type="time" value={draft.startTime} onChange={e => update("startTime", e.target.value)} /></label><label>End time<input required type="time" value={draft.endTime} onChange={e => update("endTime", e.target.value)} /></label></div></>}
          <ContentImageUploader images={draft.images} disabled={locked} onChange={images => update("images", images)} onBusy={setUploading} />
          <div className="admin-fields"><label>Sort order<input required type="number" step="1" value={draft.sortOrder} onChange={e => update("sortOrder", Number(e.target.value))} /></label><label className="admin-check"><input type="checkbox" checked={draft.isActive} onChange={e => update("isActive", e.target.checked)} /> Visible on the website</label></div>
          <div className="admin-form-actions"><button className="admin-primary-action" type="submit">{busy ? "Saving…" : "Save changes"}</button><button type="button" className="admin-secondary-action" onClick={() => { setDraft(null); setMessage(""); }}>Cancel</button></div>
        </fieldset>
      </form>
    </section> : <section className="admin-resource-card">
      <div className="admin-resource-header"><div><h2>{title}</h2><p>{items.length} records</p></div><label className="admin-search"><input aria-label={`Search ${workspace}`} placeholder={`Search ${workspace}`} value={query} onChange={e => setQuery(e.target.value)} /></label></div>
      <div className="admin-content-list">{items.filter(item => `${item.titleEn} ${item.titleEl} ${item.slug}`.toLowerCase().includes(query.toLowerCase())).map(item => <article key={item.id}>
        <div><strong>{item.titleEn}</strong><p>{item.titleEl}</p>{event && <small>{item.date} · {item.startTime}–{item.endTime}</small>}<span className={`admin-status admin-status-${item.isActive ? "in-stock" : "muted"}`}>{item.isActive ? "Published" : "Hidden"}</span></div>
        <button type="button" className="admin-row-action" onClick={() => open(item)}>Edit<span className="sr-only"> {item.titleEn}</span></button>
      </article>)}{!items.length && <p className="admin-empty">No records yet. Add your first {event ? "event" : "extra"}.</p>}</div>
    </section>}
  </AdminShell>;
}
