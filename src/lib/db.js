import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const ROOT_DIR = process.cwd();
const PICTURES_DIR = path.join(ROOT_DIR, "pictures");
const DB_PATH = path.join(ROOT_DIR, "data", "gallery.json");

const IMAGE_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".jfif", ".png", ".webp",
  ".gif", ".avif", ".bmp", ".tif", ".tiff",
  ".svg", ".heic", ".heif"
]);

export { PICTURES_DIR, IMAGE_EXTENSIONS };

const VISIBILITY_VALUES = ["public", "unlisted", "private"];

export function normalizePhoto(photo) {
  const visibility = VISIBILITY_VALUES.includes(photo.visibility) ? photo.visibility : "public";
  return {
    id: photo.id,
    name: photo.name || photo.filename,
    filename: photo.filename,
    url: `/pictures/${encodeURIComponent(photo.filename)}`,
    uploadedAt: Number(photo.uploadedAt || Date.now()),
    sizeBytes: Number(photo.sizeBytes || 0),
    favorite: Boolean(photo.favorite),
    caption: typeof photo.caption === "string" ? photo.caption : "",
    tags: Array.isArray(photo.tags) ? photo.tags.filter((tag) => typeof tag === "string").slice(0, 8) : [],
    visibility,
    token: visibility === "unlisted" && photo.token ? String(photo.token) : null
  };
}

export function loadDb() {
  if (!fs.existsSync(DB_PATH)) return { photos: [] };
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw || "{}");
    const photos = Array.isArray(parsed.photos) ? parsed.photos.map(normalizePhoto) : [];
    return { photos };
  } catch {
    return { photos: [] };
  }
}

export function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function getPhotos() {
  const db = loadDb();
  return [...db.photos].sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export function sanitizeFileStem(name) {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "photo"
  );
}

export function extFromMime(mimeType) {
  const map = {
    "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp",
    "image/gif": ".gif", "image/avif": ".avif", "image/bmp": ".bmp",
    "image/tiff": ".tiff", "image/svg+xml": ".svg", "image/heic": ".heic", "image/heif": ".heif",
  };
  return map[mimeType.toLowerCase()] || "";
}

export function ensureDiskPhotosIndexed() {
  const db = loadDb();
  const existing = new Set(db.photos.map((row) => row.filename));

  if (!fs.existsSync(PICTURES_DIR)) {
    fs.mkdirSync(PICTURES_DIR, { recursive: true });
    return;
  }

  const diskEntries = fs.readdirSync(PICTURES_DIR, { withFileTypes: true });
  let changed = false;

  for (const entry of diskEntries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;
    if (existing.has(entry.name)) continue;

    const fullPath = path.join(PICTURES_DIR, entry.name);
    const stat = fs.statSync(fullPath);

    db.photos.push(normalizePhoto({
      id: randomUUID(),
      name: entry.name,
      filename: entry.name,
      uploadedAt: stat.mtimeMs,
      sizeBytes: stat.size
    }));
    changed = true;
  }

  if (changed) saveDb(db);
}
