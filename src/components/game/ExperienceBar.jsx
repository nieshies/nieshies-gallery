"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame, xpForLevel } from "@/lib/ExperienceContext";

export default function ExperienceBar() {
  const { xp, level, progress, unlockedAchievements, achievementDefs } = useGame();
  const [showDetails, setShowDetails] = useState(false);

  const totalAchieved = achievementDefs.length;

  return (
    <>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5 }}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        onClick={() => setShowDetails((v) => !v)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-3 py-2 rounded-full cursor-pointer select-none backdrop-blur-md border transition-all duration-300"
        style={{
          backgroundColor: "rgba(10,10,10,0.7)",
          borderColor: "rgba(244,140,54,0.15)",
        }}
      >
        <div
          className="flex items-center gap-1.5 text-xs font-display font-bold tracking-wider"
          style={{ color: "rgba(244,140,54,0.8)" }}
        >
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>LV</span>
          <span>{level}</span>
        </div>

        <div className="relative w-20 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ backgroundColor: "rgba(244,140,54,0.6)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
          {xp}
        </span>
      </motion.div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-6 z-50 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-xl"
            style={{
              backgroundColor: "rgba(10,10,10,0.92)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-[10px] font-display uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              Gallery Explorer Stats
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-6">
                <span style={{ color: "rgba(255,255,255,0.4)" }}>XP</span>
                <span style={{ color: "rgba(244,140,54,0.7)" }}>{xp} / {xpForLevel(level + 1)}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Level</span>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{level}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Achievements</span>
                <span style={{ color: "rgba(255,179,71,0.7)" }}>{unlockedAchievements.length} / {totalAchieved}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
