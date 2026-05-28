import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { isEditor } from "./editorAccess";

export async function requireEditor() {
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
  if (!(await isEditor(email))) {
    return {
      response: NextResponse.json(
        { error: "awaiting approval", code: "not_editor" },
        { status: 403 },
      ),
    };
  }
  return { session };
}
