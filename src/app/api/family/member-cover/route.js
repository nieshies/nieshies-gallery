import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Pin a photo as a family member's cover by storing a "cover" tag on it.
// Removes the cover tag from any other photo in the same member folder first
// so only one photo holds the cover tag per member at a time.
export async function PATCH(request) {
  try {
    const { folder, photoUrl } = await request.json();
    if (!folder || !photoUrl) {
      return NextResponse.json({ error: "folder and photoUrl required" }, { status: 400 });
    }

    // Find any photos in this folder that currently hold the cover tag, then strip them.
    const currentCovers = await prisma.galleryPhoto.findMany({
      where: { page: "family", tags: { hasEvery: [folder, "cover"] } },
      select: { id: true, tags: true },
    });
    for (const p of currentCovers) {
      await prisma.galleryPhoto.update({
        where: { id: p.id },
        data:  { tags: p.tags.filter(t => t !== "cover") },
      });
    }

    // Set the cover tag on the requested photo
    const target = await prisma.galleryPhoto.findFirst({ where: { url: photoUrl } });
    if (!target) {
      return NextResponse.json({ error: "photo not found" }, { status: 404 });
    }
    if (!target.tags.includes("cover")) {
      await prisma.galleryPhoto.update({
        where: { id: target.id },
        data:  { tags: [...target.tags, "cover"] },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("member-cover PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Clear cover for a member (no specific photo pinned)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    if (!folder) return NextResponse.json({ error: "folder required" }, { status: 400 });

    const currentCovers = await prisma.galleryPhoto.findMany({
      where: { page: "family", tags: { hasEvery: [folder, "cover"] } },
      select: { id: true, tags: true },
    });
    for (const p of currentCovers) {
      await prisma.galleryPhoto.update({
        where: { id: p.id },
        data:  { tags: p.tags.filter(t => t !== "cover") },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("member-cover DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
