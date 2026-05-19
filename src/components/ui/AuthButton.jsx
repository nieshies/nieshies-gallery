"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Button from "./Button";

export default function AuthButton() {
  const { data: session } = useSession();

  return (
    <div className="flex justify-end mb-3">
      {session ? (
        <Button variant="ghost" onClick={() => signOut()}>
          Sign Out {session.user?.name}
        </Button>
      ) : (
        <Button variant="ghost" onClick={() => signIn("google")}>
          Sign in with Google
        </Button>
      )}
    </div>
  );
}
