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
  const folder = searchParams.get("folder") || "";
  const bucket = BUCKET_MAP[page] ?? "uploads";
  const listPath = folder || "";

  try {
    const { data, error } = await supabase.storage.from(bucket).list(listPath, {
      limit:  200,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (error) throw error;

    const files = (data || []).filter(
      (f) =>
        f.metadata?.mimetype?.startsWith("image/") &&
        !/\.(heic|heif|HEIC|HEIF)$/i.test(f.name)
    );

    const mapped = files.map((f) => {
      const filePath = folder ? `${folder}/${f.name}` : f.name;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return { f, url: urlData.publicUrl };
    });

    // Prisma join for metadata — non-fatal: photos still serve if DB is unavailable
    let dbMap = new Map();
    try {
      const urls = mapped.map((m) => m.url);
      if (urls.length) {
        const dbRows = await prisma.galleryPhoto.findMany({
          where: { url: { in: urls } },
          select: { url: true, width: true, height: true, caption: true },
        });
        dbMap = new Map(dbRows.map((p) => [p.url, p]));
      }
    } catch (dbErr) {
      console.warn("Prisma metadata join failed:", dbErr.message);
    }

    const photos = mapped.map(({ f, url }) => {
      const db = dbMap.get(url);
      return {
        id: f.id || f.name,
        name: f.name,
        url,
        caption: db?.caption || "",
        width: db?.width ?? null,
        height: db?.height ?? null,
      };
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
    const folder  = String(formData.get("folder") || "").trim();

    const error = validateFile(file);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const bucket = BUCKET_MAP[page] ?? "uploads";
    const result = await saveUpload(file, bucket, folder);

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
        tags:      [page, ...(folder ? [folder] : [])],
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
