import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/upload";
import { requireEditor } from "@/lib/requireEditor";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const photo = await prisma.galleryPhoto.findUnique({ where: { id } });
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }
    return NextResponse.json({ ...photo, uploadedAt: photo.uploadedAt.getTime() });
  } catch {
    return NextResponse.json({ error: "Failed to get photo" }, { status: 400 });
  }
}

export async function PUT(request, { params }) {
  const gate = await requireEditor();
  if (gate.response) return gate.response;
  try {
    const { id } = await params;
    const body = await request.json();

    const data = {};
    if (typeof body.favorite === "boolean") data.favorite = body.favorite;
    if (typeof body.caption === "string") data.caption = body.caption.slice(0, 140);
    if (Array.isArray(body.tags)) {
      data.tags = body.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 8);
    }
    if (["public", "unlisted", "private"].includes(body.visibility)) {
      data.visibility = body.visibility;
      if (body.visibility === "unlisted") {
        const { randomUUID } = await import("crypto");
        const existing = await prisma.galleryPhoto.findUnique({ where: { id }, select: { token: true } });
        data.token = existing?.token || randomUUID().slice(0, 12);
      } else {
        data.token = null;
      }
    }

    const photo = await prisma.galleryPhoto.update({ where: { id }, data });
    return NextResponse.json({ ok: true, photo: { ...photo, uploadedAt: photo.uploadedAt.getTime() } });
  } catch {
    return NextResponse.json({ error: "Failed to update photo" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const gate = await requireEditor();
  if (gate.response) return gate.response;
  try {
    const { id } = await params;
    const photo = await prisma.galleryPhoto.findUnique({ where: { id } });
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    await prisma.galleryPhoto.delete({ where: { id } });
    await deleteUpload(photo.url, "uploads");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 400 });
  }
}
