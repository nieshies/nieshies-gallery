import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/upload";

export async function DELETE(request, { params }) {
  try {
    const memory = await prisma.familyMemory.findUnique({
      where: { id: params.id },
    });
    if (!memory) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteUpload(memory.photoUrl, "family");
    await prisma.familyMemory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
