import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const photoDates = await prisma.galleryPhoto.findMany({
    where: { uploadedAt: { gte: start, lt: end } },
    select: { uploadedAt: true },
  });

  let prismaDates = [];
  try {
    const uploads = await prisma.upload.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { createdAt: true },
    });
    prismaDates = uploads.map((u) => u.createdAt.toISOString().slice(0, 10));
  } catch {}

  const allDates = [
    ...photoDates.map((p) => p.uploadedAt.toISOString().slice(0, 10)),
    ...prismaDates,
  ];

  const counts = {};
  for (const d of allDates) {
    counts[d] = (counts[d] || 0) + 1;
  }

  return NextResponse.json({ year, counts });
}
