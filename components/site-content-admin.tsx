"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { AdminShell } from "@/components/admin-shell";
import { contentSections, getSectionFields, readContentField, writeContentField, type ContentSection, type SiteContentRecord } from "@/lib/site-content-schema";

// Edits the public copy by section, keeping both languages and unsaved work together.
export function SiteContentAdmin({ record, productCount }: { record: SiteContentRecord; productCount: number }) {
  const [saved, setSaved] = useState(record);
  const [draft, setDraft] = useState(record.content);
  const [section, setSection] = useState<ContentSection>("home");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const selected = contentSections.find(item => item.id === section)!;
  const fields = getSectionFields(section);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved.content);

  useEffect(() => {
    // Warns before leaving the page while there is unsaved text.
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    if (dirty) window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Changes one language without discarding the other language or saved sections.
  function update(language: "el" | "en", path: string, value: string) {
    setDraft(current => { const next = structuredClone(current); writeContentField(next[language], path, value); return next; });
    setMessage("");
  }

  // Blocks in-app links that would discard a draft; saved previews open in a separate tab.
  function protectDraft(event: MouseEvent<HTMLDivElement>) {
    const link = (event.target as HTMLElement).closest("a");
    if (dirty && link && link.target !== "_blank") {
      event.preventDefault();
      setFailed(true);
      setMessage("Save or discard your changes before leaving this workspace.");
    }
  }

  // Publishes only the current section and adopts the database's returned revision.
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage(""); setFailed(false);
    const values = Object.fromEntries((["el", "en"] as const).map(language => [language, Object.fromEntries(fields.map(field => [field.path, readContentField(draft[language], field.path)]))]));
    try {
      const response = await fetch("/api/admin/site-content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, revision: saved.revision, values }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save changes.");
      setSaved(data); setDraft(data.content); setMessage("Changes saved. The Greek and English pages now use this content.");
    } catch (error) {
      setFailed(true); setMessage(error instanceof Error ? error.message : "Connection failed. Your draft is still here.");
    } finally { setBusy(false); }
  }

  return <div onClickCapture={protectDraft}><AdminShell active="site-content" productCount={productCount}>
    <header className="admin-topbar"><div><p className="admin-eyebrow">Workspace</p><h1>Site content</h1><p className="site-copy-intro">Edit the words your visitors see, in Greek and English.</p></div></header>
    <div className="site-copy-layout">
      <nav className="site-copy-sections" aria-label="Content sections">
        {contentSections.map(item => <button key={item.id} type="button" aria-current={section === item.id ? "page" : undefined} disabled={busy || (dirty && item.id !== section)} onClick={() => { setSection(item.id); setMessage(""); }}>{item.label}</button>)}
        <p>Save or discard your draft before changing sections.</p>
      </nav>
      <section className="admin-form-card site-copy-editor">
        <header className="admin-form-heading"><h2>{selected.label}</h2><p>{selected.description}</p><div className="site-copy-preview">{(["el", "en"] as const).map(language => {
          const [path, hash] = selected.href.split("#");
          return <a key={language} href={`${path}?lang=${language}${hash ? `#${hash}` : ""}`} target="_blank" rel="noreferrer">View {language === "el" ? "Greek" : "English"} page ↗</a>;
        })}</div></header>
        <form className="admin-product-form" onSubmit={save}>
          <fieldset className="admin-editor-fields" disabled={busy}>
            {fields.map(field => <div className="site-copy-field" key={field.path}><h3>{field.label}</h3><div className="admin-fields">{(["el", "en"] as const).map(language => <label key={language}><span>{language === "el" ? "Ελληνικά · Greek" : "English"}</span>{field.multiline ? <textarea lang={language} aria-label={`${field.label} — ${language === "el" ? "Greek" : "English"}`} rows={4} required maxLength={20000} value={readContentField(draft[language], field.path)} onChange={event => update(language, field.path, event.target.value)} /> : <input lang={language} aria-label={`${field.label} — ${language === "el" ? "Greek" : "English"}`} type={field.url ? "url" : "text"} required maxLength={500} value={readContentField(draft[language], field.path)} onChange={event => update(language, field.path, event.target.value)} />}</label>)}</div></div>)}
          </fieldset>
          <div className="site-copy-save">
            <p className="admin-feedback" role={failed ? "alert" : "status"}>{message || (dirty ? "Unsaved changes" : "All changes saved")}</p>
            <div className="admin-form-actions"><button className="admin-primary-action" type="submit" disabled={busy || !dirty}>{busy ? "Saving…" : "Save changes"}</button><button className="admin-secondary-action" type="button" disabled={busy || !dirty} onClick={() => { setDraft(saved.content); setMessage(""); }}>Discard changes</button></div>
          </div>
        </form>
      </section>
    </div>
  </AdminShell></div>;
}
