import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const PICTURES_DIR = path.join(process.cwd(), "pictures");

const MIME_MAP = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".jfif": "image/jpeg",
  ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
  ".avif": "image/avif", ".bmp": "image/bmp", ".svg": "image/svg+xml",
  ".tif": "image/tiff", ".tiff": "image/tiff",
  ".heic": "image/heic", ".heif": "image/heif",
};

export async function GET(request, { params }) {
  try {
    const { filename } = await params;
    const safePath = path.resolve(PICTURES_DIR, filename);

    if (!safePath.startsWith(PICTURES_DIR)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const buffer = await fs.readFile(safePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
