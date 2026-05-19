import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/upload";

export async function DELETE(request, { params }) {
  try {
    const achievement = await prisma.amnieAchievement.findUnique({
      where: { id: params.id },
    });

    if (!achievement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (achievement.photoUrl) {
      await deleteUpload(achievement.photoUrl, "amnie");
    }

    await prisma.amnieAchievement.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 });
  }
}
