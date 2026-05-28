import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { isOwnerEmail } from "./editorAccess";

export async function requireOwner() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return {
      response: NextResponse.json(
        { error: "sign in required", code: "auth_required" },
        { status: 401 },
      ),
    };
  }
  if (!isOwnerEmail(email)) {
    return {
      response: NextResponse.json(
        { error: "owner only", code: "not_owner" },
        { status: 403 },
      ),
    };
  }
  return { session };
}
