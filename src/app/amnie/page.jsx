"use client";
import dynamic from "next/dynamic";
import Providers from "../providers";
import InteractiveEffects from "@/components/features/InteractiveEffects";
import AmnieHero from "@/components/game/AmnieHero";
import LoveCounter from "@/components/game/LoveCounter";
import AmnieChecklist from "@/components/game/AmnieChecklist";
import AmnieAchievements from "@/components/game/AmnieAchievements";

const DotNav = dynamic(() => import("@/components/features/DotNav"), { ssr: false });
const AmnieDump = dynamic(() => import("@/components/features/AmnieDump"), { ssr: false });

export default function AmniePage() {
  return (
    <Providers>
      <InteractiveEffects />
      <DotNav />
      <AmnieHero />
      <AmnieDump />
      <AmnieAchievements />
      <AmnieChecklist />
      <LoveCounter />
    </Providers>
  );
}
