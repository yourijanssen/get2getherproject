export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_CONTENT_IMAGES = 12;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Accepts bundled catalogue artwork and generated public Blob image URLs only.
export function isContentImage(value: unknown): value is string {
  return typeof value === "string" && (
    /^\/images\/catalogue\/[\w-]+\.(png|jpg|jpeg|webp)$/i.test(value) ||
    /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/catalogue\/[a-z0-9-]+\.webp$/.test(value)
  );
}
