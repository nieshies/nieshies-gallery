import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/upload";

export const dynamic = "force-dynamic";

// Update a photo's caption. Upserts a minimal GalleryPhoto row if one
// doesn't exist yet (e.g. for legacy photos uploaded before captions).
export async function PATCH(request) {
  try {
    const { url, caption } = await request.json();
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
      // Derive a name/filename from the URL path tail
      const filename = decodeURIComponent(url.split("/").pop() || "photo");
      await prisma.galleryPhoto.create({
        data: {
          name:     filename,
          filename,
          url,
          caption:  trimmed,
          page:     "family",
          tags:     ["family"],
        },
      });
    }
    return NextResponse.json({ ok: true, caption: trimmed });
  } catch (err) {
    console.error("family/member/photo PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete a single photo from a family member's folder:
// 1. removes the storage object (family/<folder>/<filename>)
// 2. removes the matching GalleryPhoto record (by URL)
export async function DELETE(request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    // Storage cleanup — non-fatal so DB row still gets cleared even if file is gone
    try {
      await deleteUpload(url, "family");
    } catch (storageErr) {
      console.warn("family photo storage delete failed:", storageErr.message);
    }

    // DB cleanup — match by URL
    try {
      await prisma.galleryPhoto.deleteMany({ where: { url } });
    } catch (dbErr) {
      console.warn("family photo DB delete failed:", dbErr.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("family/member/photo DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
