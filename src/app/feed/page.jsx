"use client";
import dynamic from "next/dynamic";
import GlobalFeed from "@/components/features/GlobalFeed";
import InteractiveEffects from "@/components/features/InteractiveEffects";
import Providers from "../providers";

export default function FeedPage() {
  return (
    <Providers>
      <InteractiveEffects />
      <h1 className="m-0 mb-4 font-display uppercase text-2xl">Global Feed</h1>
      <GlobalFeed />
    </Providers>
  );
}
