import { prisma } from "./prisma";

// Owners are configured via env. They are always editors AND are the only
// accounts that can approve/deny others. Keep this list very small (usually 1).
export function isOwnerEmail(email) {
  if (!email) return false;
  const raw = process.env.OWNER_EMAILS || "";
  const list = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(String(email).toLowerCase());
}

// Async: is this email allowed to edit?
// - Owners: always yes.
// - Others: only if EditorAccess.status === "approved".
// Falls back to false if DB is unavailable so writes stay locked, never opened.
export async function isEditor(email) {
  if (!email) return false;
  if (isOwnerEmail(email)) return true;
  try {
    const row = await prisma.editorAccess.findUnique({
      where: { email: String(email).toLowerCase() },
      select: { status: true },
    });
    return row?.status === "approved";
  } catch {
    return false;
  }
}

// Record (or refresh) a sign-in attempt. New users land as "pending"; existing
// users keep whatever status they already have so denials/approvals stick.
export async function recordSignIn({ email, name, image }) {
  if (!email) {
    console.warn("[auth] recordSignIn skipped: no email");
    return;
  }
  const lower = String(email).toLowerCase();
  // Owners are auto-approved (and stay approved even if their row exists as
  // pending from before they were added to OWNER_EMAILS).
  const owner = isOwnerEmail(lower);
  try {
    const row = await prisma.editorAccess.upsert({
      where:  { email: lower },
      update: owner ? { name, image, status: "approved" } : { name, image },
      create: { email: lower, name, image, status: owner ? "approved" : "pending" },
    });
    console.log(`[auth] recordSignIn ok: ${lower} (status=${row.status})`);
  } catch (err) {
    console.error("[auth] recordSignIn FAILED:", err.message);
    console.error("(if this says 'editorAccess is undefined', restart dev server)");
  }
}
