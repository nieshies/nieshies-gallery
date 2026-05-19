"use client";
import { useEffect } from "react";

export default function AmbientGlow() {
  useEffect(() => {
    const handleMouse = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--mx", `${x}%`);
      document.documentElement.style.setProperty("--my", `${y}%`);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{
        background:
          "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,170,120,0.22), transparent 42%)",
      }}
    />
  );
}
