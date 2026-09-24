// Accepts external web albums without allowing executable URLs or embedded credentials.
export function eventAlbumUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim() || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
      ? url.href : null;
  } catch { return null; }
}

export const eventAlbumCopy = {
  en: { title: "Photos from this event", link: "View photo album", note: "Opens an external album in a new tab." },
  el: { title: "Φωτογραφίες από την εκδήλωση", link: "Δες το άλμπουμ φωτογραφιών", note: "Ανοίγει ένα εξωτερικό άλμπουμ σε νέα καρτέλα." },
};
