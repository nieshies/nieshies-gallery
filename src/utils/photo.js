const PARAMS = {
  thumb:  "width=400&quality=70&format=webp",
  medium: "width=800&quality=78&format=webp",
  full:   "width=1200&quality=85&format=webp",
};

/**
 * Returns a Supabase image-transform URL for the given size.
 * Non-Supabase URLs (data:, blob:, external) are returned unchanged.
 */
export function getPhotoUrl(url, size = "medium") {
  if (!url || !url.includes("/storage/v1/object/")) return url;
  const params = PARAMS[size] ?? PARAMS.medium;
  const renderUrl = url.replace("/storage/v1/object/", "/storage/v1/render/image/");
  return renderUrl.split("?")[0] + "?" + params;
}
