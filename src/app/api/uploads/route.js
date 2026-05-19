import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  const uploads = await prisma.upload.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      profile: { select: { id: true, name: true, image: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { select: { profileId: true } },
    },
  });

  const hasMore = uploads.length > limit;
  const items = hasMore ? uploads.slice(0, limit) : uploads;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ uploads: items, nextCursor });
}
