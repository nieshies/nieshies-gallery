import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder") || "";

  if (!folder) return NextResponse.json({ photos: [] });

  try {
    const { data, error } = await supabase.storage
      .from("family")
      .list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw error;

    const mapped = (data || [])
      .filter(f => f.metadata?.mimetype?.startsWith("image/") && !/\.(heic|heif)$/i.test(f.name))
      .map(f => {
        const { data: urlData } = supabase.storage.from("family").getPublicUrl(`${folder}/${f.name}`);
        return { f, url: urlData.publicUrl };
      });

    let dbMap = new Map();
    try {
      const urls = mapped.map(m => m.url);
      if (urls.length) {
        const dbRows = await prisma.galleryPhoto.findMany({
          where: { url: { in: urls } },
          select: { url: true, width: true, height: true, caption: true, tags: true },
        });
        dbMap = new Map(dbRows.map(p => [p.url, p]));
      }
    } catch (e) { console.warn(`family/member Prisma join:`, e.message); }

    const photos = mapped.map(({ f, url }) => {
      const db = dbMap.get(url);
      return {
        id: f.id || f.name,
        name: f.name,
        url,
        caption: db?.caption || "",
        width: db?.width ?? null,
        height: db?.height ?? null,
        isCover: Array.isArray(db?.tags) && db.tags.includes("cover"),
      };
    });

    // Pinned cover first → the family card uses photos[0] as its cover
    photos.sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0));

    return NextResponse.json(
      { photos },
      { headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
  } catch (err) {
    console.error(`family/member/${folder} GET:`, err);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}
