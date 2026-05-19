import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { saveUpload } from "@/lib/upload";
import { loadDb, saveDb, normalizePhoto } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ photos: loadDb().photos });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const name = String(formData.get("name") || "").trim();

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await saveUpload(file, "photos");
    const uploadedAt = Date.now();

    const db = loadDb();
    const photo = normalizePhoto({
      id: randomUUID(),
      name: name || file.name,
      filename: result.filename,
      url: result.url,
      uploadedAt,
      sizeBytes: result.sizeBytes,
      caption: "",
      tags: [],
      favorite: false,
    });

    db.photos.push(photo);
    saveDb(db);

    return NextResponse.json({ ok: true, photo }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to upload image" }, { status: 400 });
  }
}
