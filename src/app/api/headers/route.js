import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase.storage.from("headers").list();
    if (error) throw error;

    const photos = (data || [])
      .filter((f) => f.metadata?.mimetype?.startsWith("image/"))
      .map((f) => {
        const { data: urlData } = supabase.storage.from("headers").getPublicUrl(f.name);
        return { id: f.id || f.name, name: f.name, url: urlData.publicUrl };
      });

    return NextResponse.json({ photos });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
