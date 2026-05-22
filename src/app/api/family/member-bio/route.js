import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder");
  if (!folder) return NextResponse.json({ bio: "" });

  const member = await prisma.familyMember.findUnique({ where: { folder } });
  return NextResponse.json({ bio: member?.bio || "" });
}

export async function PATCH(request) {
  const { folder, bio } = await request.json();
  if (!folder) return NextResponse.json({ error: "folder required" }, { status: 400 });

  const member = await prisma.familyMember.upsert({
    where:  { folder },
    update: { bio },
    create: { folder, bio },
  });
  return NextResponse.json({ bio: member.bio });
}
