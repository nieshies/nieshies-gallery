import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/upload";

export const dynamic = "force-dynamic";

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
