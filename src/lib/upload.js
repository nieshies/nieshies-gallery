import { supabase } from "./supabase";

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

export async function saveUpload(file, bucket = "uploads") {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type,
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
  };
}

export async function deleteUpload(url, bucket = "uploads") {
  const filename = url.split("/").pop();
  if (!filename) return;
  await supabase.storage.from(bucket).remove([filename]);
}
