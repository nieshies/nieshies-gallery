import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/requireEditor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder");
  if (!folder) return NextResponse.json({ bio: "" });

  const member = await prisma.familyMember.findUnique({ where: { folder } });
  return NextResponse.json(
    { bio: member?.bio || "" },
    { headers: { "Cache-Control": "no-store, must-revalidate" } },
  );
}

export async function PATCH(request) {
  const gate = await requireEditor();
  if (gate.response) return gate.response;
  const { folder, bio } = await request.json();
  if (!folder) return NextResponse.json({ error: "folder required" }, { status: 400 });

  const member = await prisma.familyMember.upsert({
    where:  { folder },
    update: { bio },
    create: { folder, bio },
  });
  return NextResponse.json({ bio: member.bio });
}
