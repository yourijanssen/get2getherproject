"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { IMAGE_TYPES, MAX_CONTENT_IMAGES, MAX_IMAGE_BYTES } from "@/lib/content-images";

type Props = {
  images: string[];
  disabled: boolean;
  onChange: (images: string[]) => void;
  onBusy: (busy: boolean) => void;
  maxImages?: number;
  title?: string;
};

// Adds durable images through either the native file picker or drag and drop.
export function ContentImageUploader({ images, disabled, onChange, onBusy, maxImages = MAX_CONTENT_IMAGES, title = "Images" }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const previewDialog = useRef<HTMLDialogElement>(null);
  const [preview, setPreview] = useState<{ src: string; index: number } | null>(null);
  const uploading = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Uploads sequentially, preserving completed uploads if a later file fails.
  async function upload(files: File[]) {
    if (disabled || uploading.current || !files.length) return;
    setError("");
    if (images.length + files.length > maxImages) { setError(`You can add up to ${maxImages} image${maxImages === 1 ? "" : "s"}. Remove an image before adding more.`); return; }
    if (files.some(file => !IMAGE_TYPES.includes(file.type) || file.size === 0 || file.size > MAX_IMAGE_BYTES)) { setError("Choose JPG, PNG or WebP images, each smaller than 3 MB."); return; }
    uploading.current = true;
    onBusy(true);
    const completed = [...images];
    try {
      for (const [index, file] of files.entries()) {
        setStatus(`Uploading ${index + 1} of ${files.length}…`);
        const body = new FormData(); body.append("file", file);
        const response = await fetch("/api/admin/uploads", { method: "POST", body });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.url) throw new Error(data?.error || "Upload failed. Please try again.");
        completed.push(data.url);
        onChange([...completed]);
      }
      setStatus("Uploaded. Save changes to attach these images to this record.");
    } catch (failure) {
      setStatus("");
      setError(failure instanceof Error ? failure.message : "Connection failed. Please try again.");
    } finally { uploading.current = false; onBusy(false); }
  }

  // Moves an image to the cover position without deleting any stored files.
  function makeCover(index: number) { onChange([images[index], ...images.filter((_, i) => i !== index)]); }

  // Opens an accessible modal while preserving the unsaved editor and focus origin.
  function openPreview(src: string, index: number) {
    setPreview({ src, index });
    previewDialog.current?.showModal();
  }

  return <section className="admin-image-uploader" aria-label={title}>
    <div className="admin-image-heading"><strong>{title}</strong><span>{images.length} / {maxImages}</span></div>
    <div className={`admin-image-dropzone${dragging ? " is-dragging" : ""}`} onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false); }} onDrop={e => { e.preventDefault(); setDragging(false); void upload(Array.from(e.dataTransfer.files)); }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5" /></svg>
      <strong>Drag your images here</strong>
      <span>or choose files from your computer or phone</span>
      <button type="button" className="admin-secondary-action" disabled={disabled || images.length >= maxImages} onClick={() => input.current?.click()}>Choose images</button>
      <input ref={input} hidden aria-label="Choose image files" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ""; void upload(files); }} />
      <small>JPG, PNG or WebP · max. 3 MB per image{maxImages > 1 ? " · first image is the cover" : ""}</small>
    </div>
    {status && <p role="status">{status}</p>}
    {error && <p role="alert" className="admin-upload-error">{error}</p>}
    {images.length > 0 && <ol className="admin-image-previews">{images.map((src, index) => <li key={`${src}-${index}`}>
      <button type="button" className="admin-image-preview-trigger" disabled={disabled} aria-label={`View image ${index + 1}`} aria-haspopup="dialog" onClick={() => openPreview(src, index)}>
        <Image src={src} alt={`Selected image ${index + 1}`} width={240} height={180} unoptimized />
      </button>
      <span>{index === 0 ? "Cover image" : `Image ${index + 1}`}</span>
      <div>{index > 0 && <button type="button" disabled={disabled} onClick={() => makeCover(index)}>Make cover<span className="sr-only"> image {index + 1}</span></button>}<button type="button" disabled={disabled} onClick={() => onChange(images.filter((_, i) => i !== index))}>Remove<span className="sr-only"> image {index + 1}</span></button></div>
    </li>)}</ol>}
    <small>Images become public when uploaded. Removing an image here only detaches it after saving; it does not delete the stored file.</small>
    <dialog ref={previewDialog} className="admin-image-lightbox" aria-label="Image preview" onClose={() => setPreview(null)} onClick={e => { if (e.target === e.currentTarget) previewDialog.current?.close(); }}>
      <div className="admin-image-lightbox-content">
        <header><strong>Image preview{preview ? ` · ${preview.index + 1}` : ""}</strong><button type="button" autoFocus onClick={() => previewDialog.current?.close()} aria-label="Close image preview">Close ×</button></header>
        {preview && <Image src={preview.src} alt={`Full preview of image ${preview.index + 1}`} width={1600} height={1200} unoptimized />}
      </div>
    </dialog>
  </section>;
}
