"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/lib/ThemeContext";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <div className="min-h-screen relative overflow-x-hidden">
        <div className="fixed inset-0 z-0 bg-[#13100c]" />
        <div className="bg-blobs" aria-hidden="true">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
          <div className="bg-blob bg-blob-4" />
          <div className="bg-blob bg-smoke-1" />
          <div className="bg-blob bg-smoke-2" />
        </div>
        <div className="noise-overlay" />
        <div className="ambient-glow" />
        <div className="vignette-overlay" />
        <main className="relative z-10 w-full">
          {children}
        </main>
      </div>
    </ThemeProvider>
    </QueryClientProvider>
    </SessionProvider>
  );
}
