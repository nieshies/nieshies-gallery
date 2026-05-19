import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const updates = await prisma.statusUpdate.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(updates);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req) {
  try {
    const { content, author } = await req.json();
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }
    if (content.length > 500) {
      return NextResponse.json({ error: "content too long (max 500)" }, { status: 400 });
    }
    const update = await prisma.statusUpdate.create({
      data: {
        content: content.trim(),
        author: (author || "Anonymous").trim().slice(0, 40),
      },
    });
    return NextResponse.json(update, { status: 201 });
  } catch {
    return NextResponse.json({ error: "failed to create" }, { status: 500 });
  }
}
