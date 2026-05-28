import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isEditor, isOwnerEmail } from "@/lib/editorAccess";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;

  let pendingCount = 0;
  if (email && isOwnerEmail(email)) {
    try {
      // Don't count owners in the pending count even if their row is stale.
      const ownerList = (process.env.OWNER_EMAILS || "")
        .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
      pendingCount = await prisma.editorAccess.count({
        where: { status: "pending", email: { notIn: ownerList } },
      });
    } catch {}
  }

  return NextResponse.json({
    signedIn: !!email,
    isEditor: await isEditor(email),
    isOwner:  isOwnerEmail(email),
    pendingCount,
    email,
    name:  session?.user?.name  || null,
    image: session?.user?.image || null,
  });
}
