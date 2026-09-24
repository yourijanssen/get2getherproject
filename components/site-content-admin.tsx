"use client";

import { useState, type FormEvent } from "react";
import { useDraftProtection, useDraftRecovery } from "@/components/use-draft-protection";
import { AdminShell } from "@/components/admin-shell";
import { ContentImageUploader } from "@/components/content-image-uploader";
import { contentSections, getSectionFields, readContentField, writeContentField, type ContentSection, type SiteContentRecord } from "@/lib/site-content-schema";

// Edits the public copy by section, keeping both languages and unsaved work together.
export function SiteContentAdmin({ record, productCount }: { record: SiteContentRecord; productCount: number }) {
  const [saved, setSaved] = useState(record);
  const [draft, setDraft] = useState(record.content);
  const [section, setSection] = useState<ContentSection>("home");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const locked = busy || uploading;
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const selected = contentSections.find(item => item.id === section)!;
  const relatedWorkspace = section === "events"
    ? { href: "/admin/events", label: "Manage event listings", detail: "Dates, times, posters and individual event descriptions" }
    : section === "diy"
      ? { href: "/admin/diy-products", label: "Manage DIY products", detail: "Products, prices and availability" }
      : section === "extras"
        ? { href: "/admin/extras", label: "Manage extra offerings", detail: "Gift cards, loyalty cards and individual offerings" }
        : null;
  const fields = getSectionFields(section);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved.content);

  const { protectNavigation } = useDraftProtection(dirty, locked, message => { setFailed(true); setMessage(message); });
  useDraftRecovery("site-content", { draft, saved, section }, dirty, recovered => {
    if (recovered.draft && recovered.saved && contentSections.some(item => item.id === recovered.section)) {
      setDraft(recovered.draft); setSaved(recovered.saved); setSection(recovered.section); setMessage("Your unsaved draft was restored.");
    }
  });

  // Changes one language without discarding the other language or saved sections.
  function update(language: "el" | "en", path: string, value: string) {
    setDraft(current => { const next = structuredClone(current); writeContentField(next[language], path, value); return next; });
    setMessage("");
  }

  // Keeps the homepage slideshow identical in both languages until the manager saves.
  function updateHeroImages(images: string[]) {
    setDraft(current => ({ ...current, el: { ...current.el, heroImages: images }, en: { ...current.en, heroImages: images } }));
    setMessage("");
  }

  // Publishes only the current section and adopts the database's returned revision.
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    if (section === "home" && !draft.en.heroImages.length) {
      setFailed(true); setMessage("Add at least one homepage image before saving."); return;
    }
    setBusy(true); setMessage(""); setFailed(false);
    const values = Object.fromEntries((["el", "en"] as const).map(language => [language, Object.fromEntries(fields.map(field => [field.path, readContentField(draft[language], field.path)]))]));
    try {
      const response = await fetch("/api/admin/site-content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, revision: saved.revision, values, ...(section === "home" ? { heroImages: draft.en.heroImages } : {}) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save changes.");
      setSaved(data); setDraft(data.content); setMessage("Changes saved. The Greek and English pages now use this content.");
    } catch (error) {
      setFailed(true); setMessage(error instanceof Error ? error.message : "Connection failed. Your draft is still here.");
    } finally { setBusy(false); }
  }

  return <div onClickCapture={protectNavigation}><AdminShell active="site-content" productCount={productCount}>
    <header className="admin-topbar"><div><p className="admin-eyebrow">Workspace</p><h1>Pages & text</h1><p className="site-copy-intro">Page headings, introductions, shared text and homepage images.</p></div></header>
    <div className="site-copy-layout">
      <nav className="site-copy-sections" aria-label="Content sections">
        {contentSections.map(item => <button key={item.id} type="button" aria-current={section === item.id ? "page" : undefined} disabled={locked || (dirty && item.id !== section)} onClick={() => { setSection(item.id); setMessage(""); }}>{item.label}</button>)}
        <p>Save or discard your draft before changing sections.</p>
      </nav>
      <section className="admin-form-card site-copy-editor">
        <header className="admin-form-heading"><h2>{selected.label}</h2><p>{selected.description}</p><div className="site-copy-preview">{(["el", "en"] as const).map(language => {
          const [path, hash] = selected.href.split("#");
          return <a key={language} href={`${path}?lang=${language}${hash ? `#${hash}` : ""}`} target="_blank" rel="noreferrer">View {language === "el" ? "Greek" : "English"} page <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ display: "inline-block", verticalAlign: "middle" }}><path d="M7 17 17 7M7 7h10v10" /></svg></a>;
        })}</div></header>
        {relatedWorkspace && <div className="admin-form-heading"><a href={relatedWorkspace.href}>{relatedWorkspace.label}</a><p>{relatedWorkspace.detail}</p></div>}
        <form className="admin-product-form" onSubmit={save}>
          <fieldset className="admin-editor-fields" disabled={locked}>
            {section === "home" && <div className="site-copy-field"><h3>Homepage slideshow</h3><p>These images appear in both languages. Use Make cover to choose the first slide, then save changes.</p><ContentImageUploader images={draft.en.heroImages} disabled={locked} onChange={updateHeroImages} onBusy={setUploading} /></div>}
            {fields.map(field => <div className="site-copy-field" key={field.path}><h3>{field.label}</h3><div className="admin-fields">{(["el", "en"] as const).map(language => <label key={language}><span>{language === "el" ? "Ελληνικά · Greek" : "English"}</span>{field.multiline ? <textarea lang={language} aria-label={`${field.label} — ${language === "el" ? "Greek" : "English"}`} rows={4} required maxLength={20000} value={readContentField(draft[language], field.path)} onChange={event => update(language, field.path, event.target.value)} /> : <input lang={language} aria-label={`${field.label} — ${language === "el" ? "Greek" : "English"}`} type={field.url ? "url" : "text"} required maxLength={500} value={readContentField(draft[language], field.path)} onChange={event => update(language, field.path, event.target.value)} />}</label>)}</div></div>)}
          </fieldset>
          <div className="site-copy-save">
            <p className="admin-feedback" role={failed ? "alert" : "status"}>{message || (dirty ? "Unsaved changes" : "All changes saved")}</p>
            <div className="admin-form-actions"><button className="admin-primary-action" type="submit" disabled={locked || !dirty}>{busy ? "Saving…" : "Save changes"}</button><button className="admin-secondary-action" type="button" disabled={locked || !dirty} onClick={() => { if (!window.confirm("Discard your unsaved changes?")) return; setDraft(saved.content); setMessage(""); }}>Discard changes</button></div>
          </div>
        </form>
      </section>
    </div>
  </AdminShell></div>;
}
