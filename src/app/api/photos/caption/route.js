import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Generic caption upsert for any uploaded photo (by URL).
// If a GalleryPhoto row exists for the URL, update its caption.
// If not (legacy upload before captions or DB write previously failed),
// create a minimal row so the caption survives future fetches.
export async function PATCH(request) {
  try {
    const { url, caption, page = "home", folder = "" } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }
    const trimmed = String(caption ?? "").slice(0, 140);

    const existing = await prisma.galleryPhoto.findFirst({ where: { url } });
    if (existing) {
      await prisma.galleryPhoto.update({
        where: { id: existing.id },
        data:  { caption: trimmed },
      });
    } else {
      const filename = decodeURIComponent(url.split("/").pop() || "photo");
      await prisma.galleryPhoto.create({
        data: {
          name:     filename,
          filename,
          url,
          caption:  trimmed,
          page,
          tags:     [page, ...(folder ? [folder] : [])],
        },
      });
    }

    return NextResponse.json({ ok: true, caption: trimmed });
  } catch (err) {
    console.error("photos/caption PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
