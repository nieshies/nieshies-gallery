"use client";
import dynamic from "next/dynamic";
import Providers from "../providers";
import InteractiveEffects from "@/components/features/InteractiveEffects";

const FamilyDump = dynamic(() => import("@/components/features/FamilyDump"), { ssr: false });

export default function FamilyPage() {
  return (
    <Providers>
      <InteractiveEffects />
      <FamilyDump />
    </Providers>
  );
}
