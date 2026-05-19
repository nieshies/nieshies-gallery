import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, uploadId, content } = await request.json();

    if (!uploadId) {
      return NextResponse.json({ error: "Missing uploadId" }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { email: session.user.email },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (type === "like") {
      const existing = await prisma.like.findUnique({
        where: {
          profileId_uploadId: { profileId: profile.id, uploadId },
        },
      });

      if (existing) {
        await prisma.like.delete({ where: { id: existing.id } });
        return NextResponse.json({ liked: false });
      }

      await prisma.like.create({
        data: { profileId: profile.id, uploadId },
      });
      return NextResponse.json({ liked: true });
    }

    if (type === "comment") {
      if (!content?.trim()) {
        return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
      }

      const comment = await prisma.comment.create({
        data: {
          content: content.trim().slice(0, 500),
          profileId: profile.id,
          uploadId,
        },
        include: {
          profile: { select: { id: true, name: true, image: true } },
        },
      });

      return NextResponse.json({ comment }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to process interaction" }, { status: 500 });
  }
}
