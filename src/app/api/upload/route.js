import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload, validateFile } from "@/lib/upload";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const caption = formData.get("caption") || "";

    const error = validateFile(file);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const profile = await prisma.profile.findUnique({
      where: { email: session.user.email },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { url, filename, sizeBytes } = await saveUpload(file);

    const upload = await prisma.upload.create({
      data: {
        url,
        name: file.name,
        caption: String(caption).slice(0, 280),
        sizeBytes,
        profileId: profile.id,
      },
      include: {
        profile: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({ upload }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
