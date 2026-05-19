"use client";
import { motion } from "framer-motion";
import { useGame } from "@/lib/ExperienceContext";

export default function SoundToggle() {
  const { muted, toggleMute } = useGame();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 200, damping: 15 }}
      onClick={toggleMute}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center text-xs cursor-pointer border backdrop-blur-md transition-all duration-300"
      style={{
        backgroundColor: muted ? "rgba(255,255,255,0.04)" : "rgba(244,140,54,0.08)",
        borderColor: muted ? "rgba(255,255,255,0.12)" : "rgba(244,140,54,0.25)",
        color: muted ? "rgba(255,255,255,0.35)" : "rgba(244,140,54,0.8)",
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={muted ? "Unmute sounds" : "Mute sounds"}
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
          <path d="M15.54 8.46a5 5 0 010 7.07" />
        </svg>
      )}
    </motion.button>
  );
}
