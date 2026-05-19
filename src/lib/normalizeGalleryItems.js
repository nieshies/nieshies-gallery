function inferOrientation(width, height) {
  if (width && height) {
    if (width > height) return "landscape";
    if (width < height) return "portrait";
    return "square";
  }
  return "portrait";
}

export function normalizePhotoItem(photo, extra = {}) {
  const width = Number(photo.width) || null;
  const height = Number(photo.height) || null;

  return {
    id: photo.id,
    src: photo.url,
    caption: photo.caption || "",
    width,
    height,
    orientation: inferOrientation(width, height),
    uploadedAt: photo.uploadedAt || Date.now(),
    meta: extra.meta || null,
    raw: photo,
  };
}

export function normalizeMemoryItem(memory, extra = {}) {
  const width = Number(memory.width) || null;
  const height = Number(memory.height) || null;

  return {
    id: memory.id,
    src: memory.photoUrl,
    caption: memory.description || "",
    width,
    height,
    orientation: inferOrientation(width, height),
    uploadedAt: memory.createdAt || memory.date || Date.now(),
    meta: extra.meta || null,
    raw: memory,
  };
}

export function splitGalleryItems(items) {
  const portraits = [];
  const landscapes = [];

  for (const item of items) {
    if (item.orientation === "landscape") landscapes.push(item);
    else portraits.push(item);
  }

  return { portraits, landscapes };
}

export function chunkItems(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
