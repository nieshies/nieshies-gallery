"use client";
import dynamic from "next/dynamic";
import Home from "@/components/features/Home";
import Providers from "./providers";
import InteractiveEffects from "@/components/features/InteractiveEffects";

const DotNav = dynamic(() => import("@/components/features/DotNav"), { ssr: false });

export default function Page() {
  return (
    <Providers>
      <InteractiveEffects />
      <DotNav />
      <Home />
    </Providers>
  );
}
