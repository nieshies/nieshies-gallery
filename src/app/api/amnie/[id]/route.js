import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const memory = await prisma.amnieMemory.findUnique({
      where: { id: params.id },
    });
    if (!memory) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "public", memory.photoUrl);
    await fs.unlink(filePath).catch(() => {});

    await prisma.amnieMemory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
