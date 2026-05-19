"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/lib/ThemeContext";
import { ExperienceProvider } from "@/lib/ExperienceContext";
import AchievementToast from "@/components/game/AchievementToast";
import LevelUpCeremony from "@/components/game/LevelUpCeremony";
import PagePortal from "@/components/game/PagePortal";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
    <QueryClientProvider client={queryClient}>
    <MotionConfig reducedMotion="user">
    <ThemeProvider>
    <ExperienceProvider>
      <div className="min-h-screen relative overflow-x-hidden">
        <div className="fixed inset-0 z-0 bg-[#0a0a0a]" />
        <div className="noise-overlay" />
        <div className="ambient-glow" />
        <div className="vignette-overlay" />
        <AchievementToast />
        <LevelUpCeremony />
        <main className="relative z-10 w-full">
          <PagePortal>
            {children}
          </PagePortal>
        </main>
      </div>
    </ExperienceProvider>
    </ThemeProvider>
    </MotionConfig>
    </QueryClientProvider>
    </SessionProvider>
  );
}
