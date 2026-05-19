"use client";
import { useRef, useCallback } from "react";
import { motion } from "framer-motion";

export default function TiltCard({ children, className, style, ...rest }) {
  const ref = useRef(null);

  const handleMouseEnter = useCallback(() => {
    if (!ref.current) return;
    ref.current.dataset.hovered = "true";
  }, []);

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
    ref.current.dataset.hovered = "false";
    ref.current.style.setProperty("--mx", "50%");
    ref.current.style.setProperty("--my", "50%");
    ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
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
      {...rest}
    >
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
      <div
        className="tilt-glow"
        style={{
          background:
            "radial-gradient(circle at var(--mx) var(--my), rgba(255,170,120,0.10), transparent 42%)",
        }}
      />
    </div>
  );
}
