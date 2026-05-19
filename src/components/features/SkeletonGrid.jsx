"use client";
import { motion } from "framer-motion";

function SkeletonCard({ height }) {
  return (
    <div className="break-inside-avoid mb-4">
      <div className="rounded-2xl overflow-hidden border border-white/5 bg-[rgba(13,13,26,0.6)]">
        <div
          className="relative overflow-hidden bg-white/[0.03]"
          style={{ height }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="p-4 space-y-2">
          <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.2 }}
            />
          </div>
          <div className="h-2 w-1/2 rounded-full bg-white/[0.04] overflow-hidden relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SkeletonGrid({ count = 6 }) {
  const heights = [280, 360, 240, 320, 300, 260];

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} height={heights[i % heights.length]} />
      ))}
    </div>
  );
}
