import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "family");

async function savePhoto(formData) {
  const file = formData.get("photo");
  if (!file) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/family/${filename}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const memberName = searchParams.get("member");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  try {
    const where = memberName ? { memberName } : {};

    const memories = await prisma.familyMemory.findMany({
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where,
      orderBy: { createdAt: "desc" },
    });

    const hasNext = memories.length > limit;
    const items = hasNext ? memories.slice(0, limit) : memories;
    const nextCursor = hasNext ? items[items.length - 1].id : null;

    return NextResponse.json({ items, nextCursor });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const memberName = formData.get("memberName") || "family";
    const description = formData.get("description") || "";
    const photoUrl = await savePhoto(formData);

    if (!photoUrl) {
      return NextResponse.json({ error: "Photo required" }, { status: 400 });
    }

    const memory = await prisma.familyMemory.create({
      data: {
        photoUrl,
        memberName: String(memberName).slice(0, 50),
        description: String(description).slice(0, 500),
        date: new Date().toISOString().split("T")[0],
      },
    });

    return NextResponse.json({ memory }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
