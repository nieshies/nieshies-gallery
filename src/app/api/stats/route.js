import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const photos = await prisma.galleryPhoto.findMany({
    select: { sizeBytes: true, favorite: true },
  });

  const totalBytes = photos.reduce((sum, p) => sum + p.sizeBytes, 0);
  const favoriteCount = photos.filter((p) => p.favorite).length;

  let social = { uploads: 0, likes: 0, comments: 0, profiles: 0 };
  try {
    const [uploads, likes, comments, profiles] = await Promise.all([
      prisma.upload.count(),
      prisma.like.count(),
      prisma.comment.count(),
      prisma.profile.count(),
    ]);
    social = { uploads, likes, comments, profiles };
  } catch {}

  return NextResponse.json({
    totalPhotos: photos.length,
    favoriteCount,
    totalBytes,
    social,
  });
}
