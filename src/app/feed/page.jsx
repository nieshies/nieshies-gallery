"use client";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import GlobalFeed from "@/components/features/GlobalFeed";
import InteractiveEffects from "@/components/features/InteractiveEffects";
import Providers from "../providers";

const DotNav = dynamic(() => import("@/components/features/DotNav"), { ssr: false });

export default function FeedPage() {
  return (
    <Providers>
      <InteractiveEffects />
      <DotNav />
      <h1 className="m-0 mb-4 font-display uppercase text-2xl">Global Feed</h1>
      <GlobalFeed />
    </Providers>
  );
}
