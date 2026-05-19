import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { loadDb, saveDb, normalizePhoto, PICTURES_DIR } from "@/lib/db";

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { ids, action, value } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    }

    const db = loadDb();
    let changed = 0;

    for (const id of ids) {
      const idx = db.photos.findIndex((p) => p.id === id);
      if (idx < 0) continue;

      const photo = db.photos[idx];
      switch (action) {
        case "set-favorite":
          photo.favorite = Boolean(value);
          break;
        case "add-tags": {
          const newTags = Array.isArray(value) ? value.map((t) => String(t).trim()).filter(Boolean) : [];
          const merged = [...new Set([...photo.tags, ...newTags])];
          photo.tags = merged.slice(0, 8);
          break;
        }
        case "set-visibility":
          if (["public", "unlisted", "private"].includes(value)) {
            photo.visibility = value;
            if (value === "unlisted") {
              const { randomUUID } = await import("crypto");
              photo.token = photo.token || randomUUID().slice(0, 12);
            } else {
              photo.token = null;
            }
          }
          break;
        default:
          return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
      }
      db.photos[idx] = normalizePhoto(photo);
      changed++;
    }

    saveDb(db);
    return NextResponse.json({ ok: true, changed });
  } catch {
    return NextResponse.json({ error: "Batch operation failed" }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    }

    const db = loadDb();
    const remaining = [];
    let removed = 0;

    for (const photo of db.photos) {
      if (ids.includes(photo.id)) {
        const filePath = path.join(PICTURES_DIR, photo.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        removed++;
      } else {
        remaining.push(photo);
      }
    }

    db.photos = remaining;
    saveDb(db);
    return NextResponse.json({ ok: true, removed });
  } catch {
    return NextResponse.json({ error: "Batch delete failed" }, { status: 400 });
  }
}
