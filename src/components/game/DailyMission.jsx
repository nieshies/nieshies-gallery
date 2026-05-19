"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/ExperienceContext";

export default function DailyMission() {
  const { mission, isMissionComplete, dailyProgress, streak, playSound } = useGame();
  const [expanded, setExpanded] = useState(false);

  if (!mission) return null;

  const pct = isMissionComplete ? 100 : Math.min((dailyProgress / mission.need) * 100, 100);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setExpanded((v) => !v);
          if (!isMissionComplete) playSound("click");
        }}
        className="fixed top-6 right-16 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300"
        style={{
          backgroundColor: isMissionComplete ? "rgba(0,255,43,0.08)" : "rgba(13,13,26,0.7)",
          borderColor: isMissionComplete ? "rgba(0,255,43,0.2)" : "rgba(255,255,255,0.08)",
        }}
        title={isMissionComplete ? "Mission complete!" : "Daily Mission"}
      >
        <span className="text-xs">{isMissionComplete ? "✓" : "◎"}</span>
        <span
          className="text-[10px] font-display uppercase tracking-wider hidden sm:inline"
          style={{ color: isMissionComplete ? "rgba(0,255,43,0.7)" : "rgba(255,255,255,0.4)" }}
        >
          {isMissionComplete ? "Done" : "Mission"}
        </span>
        {streak > 0 && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,215,0,0.15)", color: "rgba(255,215,0,0.6)" }}>
            🔥{streak}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 right-16 z-50 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-xl min-w-[220px]"
            style={{
              backgroundColor: "rgba(13,13,26,0.92)",
              borderColor: isMissionComplete ? "rgba(0,255,43,0.15)" : "rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-[10px] font-display uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              Daily Mission
            </p>
            <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>
              {mission.label}
            </p>
            <div className="relative w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  backgroundColor: isMissionComplete ? "rgba(0,255,43,0.5)" : "rgba(188,19,254,0.5)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                {dailyProgress}/{mission.need}
              </span>
              {isMissionComplete && (
                <span className="text-[10px] font-mono" style={{ color: "rgba(0,255,43,0.5)" }}>
                  +50 XP
                </span>
              )}
            </div>
            {streak > 0 && (
              <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-[10px] font-mono" style={{ color: "rgba(255,215,0,0.5)" }}>
                  🔥 {streak} day streak
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
