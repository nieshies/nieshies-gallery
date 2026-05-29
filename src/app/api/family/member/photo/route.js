import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/upload";
import { requireEditor } from "@/lib/requireEditor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Update a photo's caption. Upserts a minimal GalleryPhoto row if one
// doesn't exist yet (e.g. for legacy photos uploaded before captions).
export async function PATCH(request) {
  const gate = await requireEditor();
  if (gate.response) return gate.response;
  try {
    const body = await request.json();
    const url = String(body?.url || "").trim();
    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }
    const trimmed = String(body?.caption ?? "").slice(0, 140);

    const existing = await prisma.galleryPhoto.findFirst({ where: { url } });
    let saved;
    if (existing) {
      saved = await prisma.galleryPhoto.update({
        where: { id: existing.id },
        data:  { caption: trimmed },
        select: { id: true, caption: true },
      });
    } else {
      const filename = decodeURIComponent(url.split("/").pop() || "photo");
      saved = await prisma.galleryPhoto.create({
        data: {
          name:     filename,
          filename,
          url,
          caption:  trimmed,
          page:     "family",
          tags:     ["family"],
        },
        select: { id: true, caption: true },
      });
    }
    console.log(`[family/photo caption] saved id=${saved.id} url=${url.slice(-40)} → "${trimmed}"`);
    return NextResponse.json(
      { ok: true, caption: saved.caption },
      { headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
  } catch (err) {
    console.error("family/member/photo PATCH error:", err);
    return NextResponse.json({ error: err?.message || "save failed" }, { status: 500 });
  }
}

// Delete a single photo from a family member's folder:
// 1. removes the storage object (family/<folder>/<filename>)
// 2. removes the matching GalleryPhoto record (by URL)
export async function DELETE(request) {
  const gate = await requireEditor();
  if (gate.response) return gate.response;
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    try { await deleteUpload(url, "family"); }
    catch (storageErr) { console.warn("family photo storage delete failed:", storageErr.message); }

    try { await prisma.galleryPhoto.deleteMany({ where: { url } }); }
    catch (dbErr) { console.warn("family photo DB delete failed:", dbErr.message); }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("family/member/photo DELETE error:", err);
    return NextResponse.json({ error: err?.message || "delete failed" }, { status: 500 });
  }
}
