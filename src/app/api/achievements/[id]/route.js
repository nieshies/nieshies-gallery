import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const achievement = await prisma.achievement.findUnique({ where: { id } });
    if (!achievement) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    }

    await prisma.achievement.delete({ where: { id } });

    // Extract the storage path from the public URL.
    // URL: https://xxx.supabase.co/storage/v1/object/public/amnie/achievements/filename.webp
    // We need the part after "/object/public/amnie/" → "achievements/filename.webp"
    const marker = "/object/public/amnie/";
    const markerIdx = achievement.imageUrl.indexOf(marker);
    if (markerIdx !== -1) {
      const storagePath = achievement.imageUrl.slice(markerIdx + marker.length);
      const { error: removeError } = await supabase.storage
        .from("amnie")
        .remove([storagePath]);
      if (removeError) console.error("Storage remove error:", removeError.message);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete achievement" }, { status: 400 });
  }
}
