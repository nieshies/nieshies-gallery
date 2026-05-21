import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { data, error } = await supabase.storage
      .from("family")
      .list("photos", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw error;

    const mapped = (data || [])
      .filter(f => f.metadata?.mimetype?.startsWith("image/") && !/\.(heic|heif)$/i.test(f.name))
      .map(f => {
        const { data: urlData } = supabase.storage.from("family").getPublicUrl(`photos/${f.name}`);
        return { f, url: urlData.publicUrl };
      });

    const urls = mapped.map(m => m.url);
    const dbRows = await prisma.galleryPhoto.findMany({
      where: { url: { in: urls } },
      select: { url: true, width: true, height: true, caption: true },
    });
    const dbMap = new Map(dbRows.map(p => [p.url, p]));

    const photos = mapped.map(({ f, url }) => {
      const db = dbMap.get(url);
      return { id: f.id || f.name, name: f.name, url, caption: db?.caption || "", width: db?.width ?? null, height: db?.height ?? null };
    });

    return NextResponse.json({ photos });
  } catch (err) {
    console.error("family/photos GET:", err);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}
