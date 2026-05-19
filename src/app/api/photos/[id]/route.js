import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { loadDb, saveDb, normalizePhoto, PICTURES_DIR } from "@/lib/db";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const db = loadDb();
    const index = db.photos.findIndex((photo) => photo.id === id);

    if (index < 0) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const photo = db.photos[index];
    if (typeof body.favorite === "boolean") photo.favorite = body.favorite;
    if (typeof body.caption === "string") photo.caption = body.caption.slice(0, 140);
    if (Array.isArray(body.tags)) {
      photo.tags = body.tags
        .map((tag) => String(tag).trim())
        .filter(Boolean)
        .slice(0, 8);
    }
    if (["public", "unlisted", "private"].includes(body.visibility)) {
      photo.visibility = body.visibility;
      if (body.visibility === "unlisted") {
        photo.token = photo.token || crypto.randomUUID().slice(0, 12);
      } else {
        photo.token = null;
      }
    }

    db.photos[index] = normalizePhoto(photo);
    saveDb(db);

    return NextResponse.json({ ok: true, photo: db.photos[index] });
  } catch {
    return NextResponse.json({ error: "Failed to update photo" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const db = loadDb();
    const index = db.photos.findIndex((photo) => photo.id === id);

    if (index < 0) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const [removed] = db.photos.splice(index, 1);
    saveDb(db);

    const filePath = path.join(PICTURES_DIR, removed.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 400 });
  }
}
