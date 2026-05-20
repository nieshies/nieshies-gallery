import { supabase } from "./supabase";
import sharp from "sharp";

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
  "image/heic", "image/heif",
]);

const EXT_MAP = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif", avif: "image/avif",
  heic: "image/heic", heif: "image/heif",
};

export function validateFile(file) {
  if (!file) return "No file provided";
  const mime = file.type || EXT_MAP[file.name?.split(".").pop()?.toLowerCase()] || "";
  if (!ALLOWED_TYPES.has(mime)) return "Unsupported file type";
  if (file.size > 10 * 1024 * 1024) return "File too large (max 10MB)";
  return null;
}

export async function saveUpload(file, bucket = "uploads") {
  const raw = Buffer.from(await file.arrayBuffer());

  const { data: buffer, info } = await sharp(raw)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return {
    url: urlData.publicUrl,
    filename,
    sizeBytes: buffer.length,
    width: info.width,
    height: info.height,
  };
}

export async function deleteUpload(url, bucket = "uploads") {
  const filename = url.split("/").pop();
  if (!filename) return;
  const { error } = await supabase.storage.from(bucket).remove([filename]);
  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
}
