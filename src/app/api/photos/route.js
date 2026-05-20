import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUpload, validateFile } from "@/lib/upload";

const PAGE_BUCKETS = {
  home: "uploads",
  amnie: "amnie",
  family: "family",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");

  const photos = await prisma.galleryPhoto.findMany({
    where: page ? { page } : undefined,
    orderBy: { uploadedAt: "desc" },
  });
  return NextResponse.json({
    photos: photos.map((p) => ({ ...p, uploadedAt: p.uploadedAt.getTime() })),
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const caption = String(formData.get("caption") || "").trim();
    const page = String(formData.get("page") || "home").toLowerCase();

    const error = validateFile(file);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const bucket = PAGE_BUCKETS[page] ?? "uploads";
    const result = await saveUpload(file, bucket);

    const photo = await prisma.galleryPhoto.create({
      data: {
        name: file.name,
        caption,
        filename: result.filename,
        url: result.url,
        sizeBytes: result.sizeBytes,
        width: result.width,
        height: result.height,
        tags: [page],
      },
    });

    return NextResponse.json(
      { ok: true, photo: { ...photo, uploadedAt: photo.uploadedAt.getTime() } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Photo upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to upload image" }, { status: 400 });
  }
}
