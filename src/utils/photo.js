/**
 * Returns the direct Supabase public URL for a photo.
 * Image transforms (/render/image/) require a paid Supabase plan and return 403
 * on the free tier — photos are already compressed via sharp on upload, so the
 * raw URL is used as-is. Non-Supabase URLs are returned unchanged.
 */
export function getPhotoUrl(url, _size = "medium") {
  return url || "";
}
