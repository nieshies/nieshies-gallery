import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "home";

  try {
    const rows = await prisma.galleryPhoto.findMany({
      where: { page, visibility: "public" },
      select: {
        id: true, url: true, caption: true,
        width: true, height: true, uploadedAt: true,
      },
    });

    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate  = today.getDate();
    const thisYear   = today.getFullYear();

    const matches = rows
      .filter(p => {
        const d = new Date(p.uploadedAt);
        return d.getMonth() === todayMonth && d.getDate() === todayDate;
      })
      .map(p => {
        const d = new Date(p.uploadedAt);
        return {
          ...p,
          uploadedAt: d.toISOString(),
          year:       d.getFullYear(),
          yearsAgo:   thisYear - d.getFullYear(),
        };
      })
      .sort((a, b) => b.yearsAgo - a.yearsAgo); // oldest first

    return NextResponse.json({ photos: matches, month: todayMonth + 1, day: todayDate });
  } catch (err) {
    console.error("on-this-day error:", err);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}
