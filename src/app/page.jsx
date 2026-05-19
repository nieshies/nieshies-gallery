"use client";
import dynamic from "next/dynamic";
import Home from "@/components/features/Home";
import Providers from "./providers";
import InteractiveEffects from "@/components/features/InteractiveEffects";
import LoadingScreen from "@/components/features/LoadingScreen";

const DotNav = dynamic(() => import("@/components/features/DotNav"), { ssr: false });

export default function Page() {
  return (
    <Providers>
      <LoadingScreen />
      <InteractiveEffects />
      <DotNav />
      <Home />
    </Providers>
  );
}
