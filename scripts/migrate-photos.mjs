import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  const dbPath = join(__dirname, "..", "data", "gallery.json");
  if (!existsSync(dbPath)) {
    console.log("No data/gallery.json found — nothing to migrate.");
    return;
  }

  const raw = readFileSync(dbPath, "utf8");
  const { photos } = JSON.parse(raw);
  if (!Array.isArray(photos) || photos.length === 0) {
    console.log("No photos in data/gallery.json — nothing to migrate.");
    return;
  }

  let migrated = 0;
  let skipped = 0;

  for (const p of photos) {
    const existing = await prisma.galleryPhoto.findUnique({ where: { id: p.id } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.galleryPhoto.create({
      data: {
        id: p.id,
        name: p.name || p.filename,
        filename: p.filename,
        url: p.url || `/pictures/${encodeURIComponent(p.filename)}`,
        uploadedAt: new Date(p.uploadedAt || Date.now()),
        sizeBytes: p.sizeBytes || 0,
        caption: p.caption || "",
        tags: Array.isArray(p.tags) ? p.tags : [],
        favorite: Boolean(p.favorite),
        visibility: p.visibility || "public",
        token: p.token || null,
      },
    });
    migrated++;
  }

  console.log(`Migrated ${migrated} photos, skipped ${skipped} (already exist).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
