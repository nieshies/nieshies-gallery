"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Dashboard from "@/components/features/Dashboard";
import InteractiveEffects from "@/components/features/InteractiveEffects";
import Providers from "../providers";

export default function Page() {
  return (
    <Providers>
      <InteractiveEffects />
      <Suspense fallback={
        <section className="glass-panel shadow-glass rounded-2xl p-6">
          <h2 className="m-0 mb-3 font-display uppercase text-lg tracking-wider text-white/70">Loading dashboard...</h2>
        </section>
      }>
        <Dashboard />
      </Suspense>
    </Providers>
  );
}
