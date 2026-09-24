import type { Language } from "@/lib/language";
import type { ContentRecord } from "@/lib/managed-content";

// Uses the other saved translation for each missing field without changing database content.
export function localizeContent(item: Pick<ContentRecord, "titleEl" | "titleEn" | "descriptionEl" | "descriptionEn">, language: Language) {
  const primary = language === "el" ? "El" : "En";
  const secondary = language === "el" ? "En" : "El";
  return {
    title: item[`title${primary}`]?.trim() || item[`title${secondary}`]?.trim() || "",
    description: item[`description${primary}`]?.trim() || item[`description${secondary}`]?.trim() || "",
  };
}
