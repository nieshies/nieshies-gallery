import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/upload";

export async function DELETE(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    const memory = await prisma.amnieMemory.findUnique({
      where: { id: params.id },
    });
    if (!memory) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteUpload(memory.photoUrl, "amnie");
    await prisma.amnieMemory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to delete" }, { status: 500 });
  }
}
