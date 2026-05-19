"use client";
import dynamic from "next/dynamic";
import Providers from "../providers";
import InteractiveEffects from "@/components/features/InteractiveEffects";

const AmnieDump = dynamic(() => import("@/components/features/AmnieDump"), { ssr: false });

export default function AmniePage() {
  return (
    <Providers>
      <InteractiveEffects />
      <AmnieDump />
    </Providers>
  );
}
