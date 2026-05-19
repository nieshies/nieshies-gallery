import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import {
  loadDb, saveDb, getPhotos, normalizePhoto,
  sanitizeFileStem, extFromMime, ensureDiskPhotosIndexed,
  PICTURES_DIR, IMAGE_EXTENSIONS
} from "@/lib/db";

export async function GET() {
  ensureDiskPhotosIndexed();
  return NextResponse.json({ photos: getPhotos() });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const originalName = String(body.name || "").trim();
    const dataUrl = String(body.dataUrl || "").trim();

    if (!originalName || !dataUrl) {
      return NextResponse.json({ error: "Missing image payload" }, { status: 400 });
    }

    const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl || "");
    if (!match) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const mimeType = match[1].toLowerCase();
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    if (!buffer.length) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const ext = extFromMime(mimeType) || path.extname(originalName).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
    }

    const id = randomUUID();
    const stem = sanitizeFileStem(originalName);
    const filename = `${Date.now()}-${stem}-${id.slice(0, 8)}${ext}`;
    const targetPath = path.join(PICTURES_DIR, filename);
    const uploadedAt = Date.now();

    fs.mkdirSync(PICTURES_DIR, { recursive: true });
    fs.writeFileSync(targetPath, buffer);

    const db = loadDb();
    const photo = normalizePhoto({
      id,
      name: originalName,
      filename,
      uploadedAt,
      sizeBytes: buffer.length,
      caption: "",
      tags: [],
      favorite: false
    });

    db.photos.push(photo);
    saveDb(db);

    return NextResponse.json({ ok: true, photo }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 400 });
  }
}
