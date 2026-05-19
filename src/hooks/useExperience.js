"use client";
import { useState, useCallback } from "react";

const STORAGE_KEY = "nieshies-gallery-xp";

export const XP_VALUES = {
  click: 1,
  scroll_1000: 5,
  scroll_5000: 10,
  photo_view: 10,
  quote_read: 5,
  vibe_spin: 3,
  logo_click: 2,
  milestone: 25,
};

export const ACHIEVEMENT_DEFS = [
  { id: "first-click", title: "First Contact", desc: "Click into the gallery", icon: "✦" },
  { id: "scroll-seeker", title: "Depth Seeker", desc: "Scroll past 1,000px into the void", icon: "⌛" },
  { id: "scroll-adept", title: "Void Diver", desc: "Scroll past 5,000px deep", icon: "🌀" },
  { id: "gallery-initiate", title: "Gallery Initiate", desc: "View 5 photos in the lightbox", icon: "🖼" },
  { id: "gallery-aficionado", title: "Photo Aficionado", desc: "View 20 photos in the lightbox", icon: "🌟" },
  { id: "quote-taster", title: "Quote Taster", desc: "Read 3 quotes", icon: "💬" },
  { id: "logo-devotee", title: "Logo Devotee", desc: "Click the logo 5 times", icon: "◆" },
  { id: "vibe-seeker", title: "Vibe Seeker", desc: "Spin the vibe 3 times", icon: "🎲" },
  { id: "rising-star", title: "Rising Star", desc: "Reach Level 5", icon: "⭐" },
  { id: "dedicated", title: "Dedicated Explorer", desc: "Reach Level 10", icon: "👑" },
];

function ACHIEVEMENT_CHECKS() {
  return {
    "first-click": (s) => s.clicks >= 1,
    "scroll-seeker": (s) => s.maxScroll >= 1000,
    "scroll-adept": (s) => s.maxScroll >= 5000,
    "gallery-initiate": (s) => s.photosViewed >= 5,
    "gallery-aficionado": (s) => s.photosViewed >= 20,
    "quote-taster": (s) => s.quotesRead >= 3,
    "logo-devotee": (s) => s.logoClicks >= 5,
    "vibe-seeker": (s) => s.vibeSpins >= 3,
    "rising-star": (s) => s.level >= 5,
    "dedicated": (s) => s.level >= 10,
  };
}

export function xpForLevel(level) {
  return level * level * 100;
}

export function levelFromXp(xp) {
  if (xp <= 0) return 1;
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const MISSIONS = [
  { id: "sunset", label: "Take 3 sunset photos", action: "photo_view", need: 3 },
  { id: "food", label: "Dump your best food shots", action: "photo_view", need: 2 },
  { id: "nostalgia", label: "Add one nostalgic blurry pic", action: "photo_view", need: 1 },
  { id: "color", label: "Post your loudest color photo", action: "photo_view", need: 1 },
  { id: "selfie", label: "Upload your favorite selfie", action: "photo_view", need: 1 },
  { id: "scroll", label: "Explore deep into the void", action: "scroll_5000", need: 1 },
  { id: "quotes", label: "Read 3 inspiring quotes", action: "quote_read", need: 3 },
  { id: "clicks", label: "Click around the gallery", action: "click", need: 10 },
  { id: "vibes", label: "Spin the vibe 2 times", action: "vibe_spin", need: 2 },
  { id: "explore", label: "View 5 photos up close", action: "photo_view", need: 5 },
];

function dailyMission(seed) {
  const idx = Math.abs(seed) % MISSIONS.length;
  return MISSIONS[idx];
}

function defaultState() {
  return {
    xp: 0,
    clicks: 0,
    maxScroll: 0,
    photosViewed: 0,
    quotesRead: 0,
    logoclicks: 0,
    vibeSpins: 0,
    unlocked: [],
    streak: 0,
    lastVisitDate: null,
    missionsCompleted: [],
    dailyProgress: 0,
  };
}

function computeStreak(saved) {
  const d = today();
  if (!saved.lastVisitDate) return { streak: 0, needsUpdate: true };
  if (saved.lastVisitDate === d) return { streak: saved.streak, needsUpdate: false };
  const prev = new Date(saved.lastVisitDate + "T00:00:00");
  const curr = new Date(d + "T00:00:00");
  const diff = (curr - prev) / (1000 * 60 * 60 * 24);
  if (diff === 1) return { streak: (saved.streak || 0) + 1, needsUpdate: true };
  return { streak: 1, needsUpdate: true };
}

function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const base = { ...defaultState(), ...parsed };
      const { streak, needsUpdate } = computeStreak(base);
      if (needsUpdate) base.streak = streak;
      if (needsUpdate) base.lastVisitDate = today();
      // Reset daily progress if new day
      if (base.lastVisitDate !== today()) {
        base.dailyProgress = 0;
      }
      return base;
    }
  } catch {}
  return null;
}

function saveState(s) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        xp: s.xp,
        clicks: s.clicks,
        maxScroll: s.maxScroll,
        photosViewed: s.photosViewed,
        quotesRead: s.quotesRead,
        logoclicks: s.logoclicks,
        vibeSpins: s.vibeSpins,
        unlocked: s.unlocked,
        streak: s.streak,
        lastVisitDate: s.lastVisitDate,
        missionsCompleted: s.missionsCompleted,
        dailyProgress: s.dailyProgress,
      })
    );
  } catch {}
}

export default function useExperience() {
  const [tracker, setTracker] = useState(() => loadState() || defaultState());
  const [newAchievement, setNewAchievement] = useState(null);

  const level = levelFromXp(tracker.xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const progress =
    nextLevelXp > currentLevelXp
      ? Math.min((tracker.xp - currentLevelXp) / (nextLevelXp - currentLevelXp), 1)
      : 0;

  const dateSeed = parseInt(today().replace(/-/g, ""), 10);
  const mission = dailyMission(dateSeed + 7);
  const isMissionComplete = tracker.missionsCompleted.includes(today());

  const completeMission = useCallback(() => {
    setTracker((prev) => {
      if (prev.missionsCompleted.includes(today())) return prev;
      const next = { ...prev, missionsCompleted: [...prev.missionsCompleted, today()], xp: prev.xp + 50 };
      saveState(next);
      return next;
    });
  }, []);

  const dispatch = useCallback((action, payload) => {
    const xpGain = XP_VALUES[action] || 0;

    setTracker((prev) => {
      const next = { ...prev };
      switch (action) {
        case "click":
          next.clicks += 1;
          break;
        case "scroll_1000":
        case "scroll_5000":
          next.maxScroll = Math.max(next.maxScroll, payload || 0);
          break;
        case "photo_view":
          next.photosViewed += 1;
          break;
        case "quote_read":
          next.quotesRead += 1;
          break;
        case "logo_click":
          next.logoclicks += 1;
          break;
        case "vibe_spin":
          next.vibeSpins += 1;
          break;
      }

      next.xp += xpGain;

      if (!isMissionComplete && mission) {
        const trackerKey = mission.action;
        if (trackerKey === "scroll_5000") {
          next.dailyProgress = Math.min(mission.need, next.maxScroll >= 5000 ? 1 : 0);
        } else if (trackerKey === "photo_view") {
          const key = action === "photo_view" ? next.photosViewed : -1;
          next.dailyProgress = Math.min(mission.need, key);
        } else if (trackerKey === "click") {
          next.dailyProgress = Math.min(mission.need, next.clicks);
        } else if (trackerKey === "quote_read") {
          next.dailyProgress = Math.min(mission.need, next.quotesRead);
        } else if (trackerKey === "vibe_spin") {
          next.dailyProgress = Math.min(mission.need, next.vibeSpins);
        }
      }

      const nextLevel = levelFromXp(next.xp);
      next.level = nextLevel;

      const checks = ACHIEVEMENT_CHECKS();
      const newlyUnlocked = ACHIEVEMENT_DEFS.filter(
        (a) => !next.unlocked.includes(a.id) && checks[a.id] && checks[a.id](next)
      );

      if (newlyUnlocked.length > 0) {
        next.unlocked = [...next.unlocked, ...newlyUnlocked.map((a) => a.id)];
        next.xp += XP_VALUES.milestone * newlyUnlocked.length;
        const last = newlyUnlocked[newlyUnlocked.length - 1];
        setTimeout(() => setNewAchievement(last), 0);
      }

      // Auto-complete mission when progress reaches need
      if (!next.missionsCompleted.includes(today()) && next.dailyProgress >= mission.need) {
        next.missionsCompleted = [...next.missionsCompleted, today()];
        next.xp += 50;
      }

      saveState(next);
      return next;
    });
  }, [isMissionComplete, mission]);

  const clearNewAchievement = useCallback(() => setNewAchievement(null), []);

  return {
    xp: tracker.xp,
    level,
    progress,
    clicks: tracker.clicks,
    maxScroll: tracker.maxScroll,
    photosViewed: tracker.photosViewed,
    quotesRead: tracker.quotesRead,
    logoclicks: tracker.logoclicks,
    vibeSpins: tracker.vibeSpins,
    unlockedAchievements: tracker.unlocked,
    achievementDefs: ACHIEVEMENT_DEFS,
    newAchievement,
    clearNewAchievement,
    dispatch,
    streak: tracker.streak || 0,
    mission,
    isMissionComplete,
    dailyProgress: tracker.dailyProgress || 0,
    completeMission,
  };
}
