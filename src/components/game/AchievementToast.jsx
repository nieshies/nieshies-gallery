"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/ExperienceContext";

const ACHIEVEMENT_COLORS = {
  "first-click": "rgba(188,19,254,0.3)",
  "scroll-seeker": "rgba(0,255,255,0.3)",
  "scroll-adept": "rgba(0,255,255,0.4)",
  "gallery-initiate": "rgba(0,255,43,0.3)",
  "gallery-aficionado": "rgba(0,255,43,0.4)",
  "quote-taster": "rgba(255,58,242,0.3)",
  "logo-devotee": "rgba(123,47,255,0.3)",
  "vibe-seeker": "rgba(255,107,53,0.3)",
  "rising-star": "rgba(0,255,43,0.5)",
  "dedicated": "rgba(255,215,0,0.5)",
};

export default function AchievementToast() {
  const { newAchievement, clearNewAchievement, achievementDefs, playSound } = useGame();
  const timerRef = useRef(null);

  const def = newAchievement
    ? achievementDefs.find((a) => a.id === newAchievement.id)
    : null;

  useEffect(() => {
    if (newAchievement) {
      playSound("chime");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        clearNewAchievement();
      }, 4000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [newAchievement, clearNewAchievement, playSound]);

  return (
    <AnimatePresence mode="wait">
      {def && (
        <motion.div
          key={def.id}
          initial={{ opacity: 0, x: 80, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 80, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed top-24 right-6 z-[60] max-w-[280px] rounded-xl border backdrop-blur-xl overflow-hidden shadow-2xl"
          style={{
            backgroundColor: "rgba(13,13,26,0.92)",
            borderColor: ACHIEVEMENT_COLORS[def.id] || "rgba(0,255,43,0.2)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `linear-gradient(135deg, ${ACHIEVEMENT_COLORS[def.id] || "rgba(0,255,43,0.3)"}, transparent)`,
            }}
          />
          <div className="relative px-4 py-3 flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
              style={{
                backgroundColor: ACHIEVEMENT_COLORS[def.id] || "rgba(0,255,43,0.15)",
              }}
            >
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
              >
                {def.icon}
              </motion.span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-display uppercase tracking-widest" style={{ color: "rgba(0,255,43,0.7)" }}>
                Achievement Unlocked
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: "rgba(255,255,255,0.9)" }}>
                {def.title}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                {def.desc}
              </p>
            </div>
            <button
              onClick={clearNewAchievement}
              className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center text-[10px] rounded-full transition-colors"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              &#10005;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
