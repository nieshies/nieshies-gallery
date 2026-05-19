"use client";
import { motion } from "framer-motion";
import { useViewMode } from "@/lib/ViewModeContext";
import { useTheme } from "@/lib/ThemeContext";

const MODE_LABELS = {
  grid: "Grid",
  scattered: "Dump",
  filmstrip: "Flow",
};

const MODE_ICONS = {
  grid: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  scattered: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 2a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" />
    </svg>
  ),
  filmstrip: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

export default function ViewModeToggle({ className = "" }) {
  const { mode, setMode, modes } = useViewMode();
  const { theme } = useTheme();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-sm ${className}`}
      style={theme === "light" ? { borderColor: "rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.03)" } : undefined}
    >
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider transition-all duration-200 ${
            mode === m
              ? "text-white"
              : "text-white/40 hover:text-white/70"
          }`}
          style={mode === m
            ? theme === "light"
              ? { color: "#1a1a1a" }
              : {}
            : theme === "light"
              ? { color: "rgba(0,0,0,0.4)" }
              : undefined}
        >
          {mode === m && (
            <motion.span
              layoutId="view-mode-pill"
              className="absolute inset-0 rounded-full bg-white/10"
              style={theme === "light" ? { background: "rgba(0,0,0,0.08)" } : undefined}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {MODE_ICONS[m]}
            {MODE_LABELS[m]}
          </span>
        </button>
      ))}
    </div>
  );
}
