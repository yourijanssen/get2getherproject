import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { isAdmin } from "@/lib/admin-auth";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/content-images";

export const runtime = "nodejs";

// Validates and re-encodes manager uploads before persisting public catalogue artwork.
export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Your session expired. Sign in again." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > MAX_IMAGE_BYTES + 65536) return Response.json({ error: "Choose an image smaller than 3 MB." }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !IMAGE_TYPES.includes(file.type) || file.size === 0) return Response.json({ error: "Choose a JPG, PNG or WebP image." }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return Response.json({ error: "Choose an image smaller than 3 MB." }, { status: 413 });
  let image: Buffer;
  try {
    const source = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 });
    const metadata = await source.metadata();
    if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1) throw new Error("Unsupported image");
    // Auto-orient phone photos and strip EXIF/location data from the public image.
    image = await source.rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch {
    return Response.json({ error: "This image could not be read. Choose a non-animated JPG, PNG or WebP image (up to 40 megapixels)." }, { status: 400 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return Response.json({ error: "Image storage is not connected yet. Connect Vercel Blob before uploading. Your other changes are still in the editor." }, { status: 503 });
  try {
    const blob = await put(`catalogue/${randomUUID()}.webp`, image, { access: "public", contentType: "image/webp", addRandomSuffix: false });
    return Response.json({ url: blob.url }, { status: 201 });
  } catch {
    return Response.json({ error: "Image storage is unavailable. Please try again; your existing images have not changed." }, { status: 502 });
  }
}
