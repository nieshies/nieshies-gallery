import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUpload, validateFile } from "@/lib/upload";

export async function GET() {
  try {
    const achievements = await prisma.amnieAchievement.findMany({
      orderBy: [{ achievementDate: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ achievements });
  } catch {
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const note = String(formData.get("note") || "").trim();
    const achievementDate = String(formData.get("achievementDate") || "").trim();
    const file = formData.get("photo");

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let photoUrl = null;
    if (file && typeof file === "object" && file.size) {
      const error = validateFile(file);
      if (error) return NextResponse.json({ error }, { status: 400 });
      const saved = await saveUpload(file, "amnie");
      photoUrl = saved.url;
    }

    const achievement = await prisma.amnieAchievement.create({
      data: {
        title: title.slice(0, 140),
        note: note ? note.slice(0, 500) : null,
        achievementDate: achievementDate || null,
        photoUrl,
      },
    });

    return NextResponse.json({ achievement }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 });
  }
}
