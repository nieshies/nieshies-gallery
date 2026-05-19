"use client";
import { useRef, useCallback } from "react";

export default function TiltCard({ children, className, style }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const tiltX = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * -16;
    ref.current.style.setProperty("--mx", `${x}%`);
    ref.current.style.setProperty("--my", `${y}%`);
    ref.current.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty("--mx", "50%");
    ref.current.style.setProperty("--my", "50%");
    ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card ${className || ""}`}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 150ms ease-out",
        "--mx": "50%",
        "--my": "50%",
        transform: "perspective(900px) rotateX(0deg) rotateY(0deg)",
        ...style,
      }}
    >
      {children}
      <div
        className="tilt-glow"
        style={{
          background:
            "radial-gradient(circle at var(--mx) var(--my), rgba(255,170,120,0.22), transparent 42%)",
        }}
      />
    </div>
  );
}
