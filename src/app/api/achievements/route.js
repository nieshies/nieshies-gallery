import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import sharp from "sharp";
import { validateFile } from "@/lib/upload";

export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { year: "desc" },
    });
    return NextResponse.json({ achievements });
  } catch {
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const year = String(formData.get("year") || "").trim();

    const fileError = validateFile(file);
    if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
    if (!year) return NextResponse.json({ error: "Year required" }, { status: 400 });

    const raw = Buffer.from(await file.arrayBuffer());
    const { data: buffer } = await sharp(raw)
      .rotate()
      .resize({ width: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    const slug = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const storagePath = `achievements/${slug}`;

    const { error: uploadError } = await supabase.storage
      .from("amnie")
      .upload(storagePath, buffer, { contentType: "image/webp", upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("amnie").getPublicUrl(storagePath);

    const achievement = await prisma.achievement.create({
      data: { title, description, year, imageUrl: urlData.publicUrl },
    });

    return NextResponse.json({ ok: true, achievement }, { status: 201 });
  } catch (err) {
    console.error("Achievement create error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create achievement" },
      { status: 400 }
    );
  }
}
