import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|tiff?|bmp)$/i;

export async function GET() {
  try {
    const { data, error } = await supabase.storage
      .from("amnie")
      .list("hero", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw error;

    const photos = (data || [])
      .filter(
        (f) =>
          (f.metadata?.mimetype?.startsWith("image/") || IMAGE_EXT.test(f.name)) &&
          !/\.(heic|heif)$/i.test(f.name)
      )
      .map((f) => {
        const { data: urlData } = supabase.storage
          .from("amnie")
          .getPublicUrl(`hero/${f.name}`);
        return { id: f.id || f.name, name: f.name, url: urlData.publicUrl };
      });

    return NextResponse.json({ photos });
  } catch (err) {
    console.error("amnie/hero GET:", err);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}
