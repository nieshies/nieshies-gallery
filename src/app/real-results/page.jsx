"use client";
import InteractiveEffects from "@/components/features/InteractiveEffects";
import QuotesContent from "./QuotesContent";
import Providers from "../providers";

export default function RealResultsPage() {
  return (
    <Providers>
      <InteractiveEffects />
      <QuotesContent />
    </Providers>
  );
}
