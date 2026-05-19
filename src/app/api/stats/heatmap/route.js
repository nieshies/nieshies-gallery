import { NextResponse } from "next/server";
import { getPhotos } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const photoDates = getPhotos()
    .filter((p) => {
      const d = new Date(p.uploadedAt);
      return d >= start && d < end;
    })
    .map((p) => new Date(p.uploadedAt).toISOString().slice(0, 10));

  let prismaDates = [];
  try {
    const uploads = await prisma.upload.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { createdAt: true },
    });
    prismaDates = uploads.map((u) => u.createdAt.toISOString().slice(0, 10));
  } catch {}

  const allDates = [...photoDates, ...prismaDates];
  const counts = {};
  for (const d of allDates) {
    counts[d] = (counts[d] || 0) + 1;
  }

  return NextResponse.json({ year, counts });
}
