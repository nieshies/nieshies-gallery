"use client";
import { SessionProvider } from "next-auth/react";
import { EditorGateProvider } from "@/lib/EditorGate";

export default function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <EditorGateProvider>{children}</EditorGateProvider>
    </SessionProvider>
  );
}
