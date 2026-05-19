"use client";
import dynamic from "next/dynamic";
import Providers from "../providers";
import InteractiveEffects from "@/components/features/InteractiveEffects";

const DotNav = dynamic(() => import("@/components/features/DotNav"), { ssr: false });
const FamilyDump = dynamic(() => import("@/components/features/FamilyDump"), { ssr: false });

export default function FamilyPage() {
  return (
    <Providers>
      <InteractiveEffects />
      <DotNav />
      <FamilyDump />
    </Providers>
  );
}
