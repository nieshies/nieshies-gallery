"use client";
import dynamic from "next/dynamic";
import InteractiveEffects from "@/components/features/InteractiveEffects";
import QuotesContent from "./QuotesContent";
import Providers from "../providers";

const DotNav = dynamic(() => import("@/components/features/DotNav"), { ssr: false });

export default function RealResultsPage() {
  return (
    <Providers>
      <InteractiveEffects />
      <DotNav />
      <QuotesContent />
    </Providers>
  );
}
