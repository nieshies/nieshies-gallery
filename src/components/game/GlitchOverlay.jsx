"use client";
import { useEffect, useRef, useState } from "react";

export default function GlitchOverlay({ active }) {
  const [glitchX, setGlitchX] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) {
      setGlitchX(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const trigger = () => {
      if (Math.random() > 0.15) return;
      setGlitchX((Math.random() - 0.5) * 4);
      setTimeout(() => setGlitchX(0), 60 + Math.random() * 80);
    };
    intervalRef.current = setInterval(trigger, 300 + Math.random() * 600);
    return () => clearInterval(intervalRef.current);
  }, [active]);

  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl"
      style={{ transform: `translateX(${glitchX}px)` }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,255,255,0.03) 2px,
            rgba(0,255,255,0.03) 4px
          )`,
          mixBlendMode: "overlay",
        }}
      />

      {active && glitchX !== 0 && (
        <>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `rgba(255,0,0,0.08)`,
              transform: `translateX(${-glitchX * 1.5}px)`,
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `rgba(0,100,255,0.08)`,
              transform: `translateX(${glitchX * 1.5}px)`,
              mixBlendMode: "screen",
            }}
          />
        </>
      )}

      {active && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(
              180deg,
              transparent 0%,
              rgba(188,19,254,0.02) 50%,
              transparent 100%
            )`,
            backgroundSize: "100% 4px",
          }}
        />
      )}
    </div>
  );
}
