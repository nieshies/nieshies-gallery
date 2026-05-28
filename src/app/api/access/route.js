import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/requireOwner";
import { isOwnerEmail } from "@/lib/editorAccess";

export const dynamic = "force-dynamic";

// Owner only: list every person who has signed in, with their status.
export async function GET() {
  const gate = await requireOwner();
  if (gate.response) return gate.response;
  try {
    const rows = await prisma.editorAccess.findMany({
      orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
    });
    const annotated = rows.map(r => ({ ...r, isOwner: isOwnerEmail(r.email) }));
    return NextResponse.json({ access: annotated });
  } catch (err) {
    return NextResponse.json({ access: [], error: err.message }, { status: 500 });
  }
}

// Owner only: approve / deny / reset a person.
export async function PATCH(request) {
  const gate = await requireOwner();
  if (gate.response) return gate.response;
  try {
    const { email, status } = await request.json();
    const lower = String(email || "").toLowerCase();
    if (!lower) return NextResponse.json({ error: "email required" }, { status: 400 });
    if (!["approved", "denied", "pending"].includes(status)) {
      return NextResponse.json({ error: "bad status" }, { status: 400 });
    }
    // Owners can never be denied or set to pending — they're owners by env config.
    const { isOwnerEmail } = await import("@/lib/editorAccess");
    if (isOwnerEmail(lower) && status !== "approved") {
      return NextResponse.json({ error: "cannot change owner status" }, { status: 400 });
    }
    const decidedBy = gate.session.user.email;
    const row = await prisma.editorAccess.update({
      where: { email: lower },
      data:  { status, decidedAt: new Date(), decidedBy },
    });
    return NextResponse.json({ ok: true, row });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Owner only: remove a record entirely (e.g. cleanup).
export async function DELETE(request) {
  const gate = await requireOwner();
  if (gate.response) return gate.response;
  try {
    const { email } = await request.json();
    const lower = String(email || "").toLowerCase();
    if (!lower) return NextResponse.json({ error: "email required" }, { status: 400 });
    await prisma.editorAccess.delete({ where: { email: lower } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
