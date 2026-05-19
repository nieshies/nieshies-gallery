"use client";
import { createContext, useContext, useMemo } from "react";
import useSound from "@/hooks/useSound";
import useExperience, { xpForLevel as _xpForLevel } from "@/hooks/useExperience";
export const xpForLevel = _xpForLevel;

const ExperienceContext = createContext(null);

export function ExperienceProvider({ children }) {
  const sound = useSound();
  const xp = useExperience();

  const value = useMemo(() => ({ ...sound, ...xp }), [sound, xp]);

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    return {
      muted: false,
      toggleMute: () => {},
      playSound: () => {},
      xp: 0,
      level: 1,
      progress: 0,
      clicks: 0,
      unlockedAchievements: [],
      achievementDefs: [],
      newAchievement: null,
      clearNewAchievement: () => {},
      dispatch: () => {},
    };
  }
  return ctx;
}
