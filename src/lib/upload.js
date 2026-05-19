import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
  "image/heic", "image/heif",
]);

export function validateFile(file) {
  if (!file) return "No file provided";
  if (!ALLOWED_TYPES.has(file.type)) return "Unsupported file type";
  if (file.size > 10 * 1024 * 1024) return "File too large (max 10MB)";
  return null;
}

export async function saveUpload(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
    sizeBytes: buffer.length,
  };
}
