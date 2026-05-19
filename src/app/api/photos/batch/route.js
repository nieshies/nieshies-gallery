import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/upload";

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { ids, action, value } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    }

    let changed = 0;

    for (const id of ids) {
      const data = {};
      switch (action) {
        case "set-favorite":
          data.favorite = Boolean(value);
          break;
        case "add-tags": {
          const photo = await prisma.galleryPhoto.findUnique({ where: { id }, select: { tags: true } });
          if (!photo) continue;
          const newTags = Array.isArray(value) ? value.map((t) => String(t).trim()).filter(Boolean) : [];
          data.tags = [...new Set([...photo.tags, ...newTags])].slice(0, 8);
          break;
        }
        case "set-visibility":
          if (["public", "unlisted", "private"].includes(value)) {
            data.visibility = value;
            if (value === "unlisted") {
              const existing = await prisma.galleryPhoto.findUnique({ where: { id }, select: { token: true } });
              const { randomUUID } = await import("crypto");
              data.token = existing?.token || randomUUID().slice(0, 12);
            } else {
              data.token = null;
            }
          }
          break;
        default:
          return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
      }
      await prisma.galleryPhoto.update({ where: { id }, data });
      changed++;
    }

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

    const photos = await prisma.galleryPhoto.findMany({
      where: { id: { in: ids } },
      select: { id: true, url: true },
    });

    await prisma.galleryPhoto.deleteMany({
      where: { id: { in: ids } },
    });

    await Promise.all(photos.map((p) => deleteUpload(p.url, "uploads")));

    return NextResponse.json({ ok: true, removed: photos.length });
  } catch {
    return NextResponse.json({ error: "Batch delete failed" }, { status: 400 });
  }
}
