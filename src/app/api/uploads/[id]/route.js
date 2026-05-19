import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  const { id } = await params;

  const upload = await prisma.upload.findUnique({
    where: { id },
    include: {
      profile: { select: { id: true, name: true, image: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { select: { profileId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          profile: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!upload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ upload });
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { caption } = await request.json();

  const profile = await prisma.profile.findUnique({
    where: { email: session.user.email },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const upload = await prisma.upload.findUnique({ where: { id } });
  if (!upload || upload.profileId !== profile.id) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
  }

  const updated = await prisma.upload.update({
    where: { id },
    data: { caption: String(caption).slice(0, 280) },
    include: {
      profile: { select: { id: true, name: true, image: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json({ upload: updated });
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const profile = await prisma.profile.findUnique({
    where: { email: session.user.email },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const upload = await prisma.upload.findUnique({ where: { id } });
  if (!upload || upload.profileId !== profile.id) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
  }

  await prisma.upload.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
