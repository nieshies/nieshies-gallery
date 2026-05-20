import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { saveUpload, validateFile } from "@/lib/upload";

export async function GET() {
  try {
    const { data, error } = await supabase.storage.from("headers").list();
    if (error) throw error;

    const photos = (data || [])
      .filter((f) => f.metadata?.mimetype?.startsWith("image/"))
      .filter((f) => !/\.(heic|heif|HEIC|HEIF)$/i.test(f.name))
      .map((f) => {
        const { data: urlData } = supabase.storage.from("headers").getPublicUrl(f.name);
        return { id: f.id || f.name, name: f.name, url: urlData.publicUrl };
      });

    return NextResponse.json({ photos });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    const error = validateFile(file);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const result = await saveUpload(file, "headers");
    return NextResponse.json(
      { ok: true, url: result.url, filename: result.filename },
      { status: 201 }
    );
  } catch (err) {
    console.error("Headers upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to upload" }, { status: 400 });
  }
}
