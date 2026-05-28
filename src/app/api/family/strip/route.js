import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase.storage
      .from("family")
      .list("strip", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw error;

    const mapped = (data || [])
      .filter(f => f.metadata?.mimetype?.startsWith("image/") && !/\.(heic|heif)$/i.test(f.name))
      .map(f => {
        const { data: urlData } = supabase.storage.from("family").getPublicUrl(`strip/${f.name}`);
        return { f, url: urlData.publicUrl };
      });

    let dbMap = new Map();
    try {
      const urls = mapped.map(m => m.url);
      if (urls.length) {
        const dbRows = await prisma.galleryPhoto.findMany({ where: { url: { in: urls } }, select: { url: true, width: true, height: true, caption: true } });
        dbMap = new Map(dbRows.map(p => [p.url, p]));
      }
    } catch (e) { console.warn("family/strip Prisma join:", e.message); }

    const photos = mapped.map(({ f, url }) => {
      const db = dbMap.get(url);
      return { id: f.id || f.name, name: f.name, url, caption: db?.caption || "", width: db?.width ?? null, height: db?.height ?? null };
    });

    return NextResponse.json({ photos });
  } catch (err) {
    console.error("family/strip GET:", err);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}
