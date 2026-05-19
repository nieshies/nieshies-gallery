import { supabase } from "./supabase";
import sizeOf from "image-size";

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
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  let width = null;
  let height = null;
  try {
    const dim = sizeOf(buffer);
    width = dim.width;
    height = dim.height;
  } catch {}

  const contentType = file.type || EXT_MAP[file.name?.split(".").pop()?.toLowerCase()] || "image/jpeg";
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType,
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
    width,
    height,
  };
}

export async function deleteUpload(url, bucket = "uploads") {
  const filename = url.split("/").pop();
  if (!filename) return;
  await supabase.storage.from(bucket).remove([filename]);
}
