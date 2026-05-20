import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { saveUpload, validateFile } from "@/lib/upload";

const BUCKET_MAP = {
  home:   "uploads",
  amnie:  "amnie",
  family: "family",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page   = searchParams.get("page") || "home";
  const bucket = BUCKET_MAP[page] ?? "uploads";

  try {
    const { data, error } = await supabase.storage.from(bucket).list("", {
      limit:  200,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (error) throw error;

    const photos = (data || [])
      .filter(
        (f) =>
          f.metadata?.mimetype?.startsWith("image/") &&
          !/\.(heic|heif|HEIC|HEIF)$/i.test(f.name)
      )
      .map((f) => {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(f.name);
        return { id: f.id || f.name, name: f.name, url: urlData.publicUrl, caption: "" };
      });

    return NextResponse.json({ photos });
  } catch (err) {
    console.error("Photos GET error:", err);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file    = formData.get("file");
    const caption = String(formData.get("caption") || "").trim();
    const page    = String(formData.get("page") || "home").toLowerCase();

    const error = validateFile(file);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const bucket = BUCKET_MAP[page] ?? "uploads";
    const result = await saveUpload(file, bucket);

    const photo = await prisma.galleryPhoto.create({
      data: {
        name:      file.name,
        caption,
        filename:  result.filename,
        url:       result.url,
        sizeBytes: result.sizeBytes,
        width:     result.width,
        height:    result.height,
        page,
        tags:      [page],
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
