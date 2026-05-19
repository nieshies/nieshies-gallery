import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUpload, validateFile } from "@/lib/upload";

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
    const file = formData.get("photo");
    const memberName = formData.get("memberName") || "family";
    const description = formData.get("description") || "";

    const error = validateFile(file);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const { url } = await saveUpload(file, "family");

    const memory = await prisma.familyMemory.create({
      data: {
        photoUrl: url,
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
