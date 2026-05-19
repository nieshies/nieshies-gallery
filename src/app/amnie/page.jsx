"use client";
import dynamic from "next/dynamic";
import Providers from "../providers";
import InteractiveEffects from "@/components/features/InteractiveEffects";

const DotNav = dynamic(() => import("@/components/features/DotNav"), { ssr: false });
const AmnieDump = dynamic(() => import("@/components/features/AmnieDump"), { ssr: false });

export default function AmniePage() {
  return (
    <Providers>
      <InteractiveEffects />
      <DotNav />
      <AmnieDump />
    </Providers>
  );
}
