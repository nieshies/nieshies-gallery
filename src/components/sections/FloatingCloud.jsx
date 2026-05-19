"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

const POSITIONS = [
  { x: 5, y: 4, r: -5, dur: 7.0 },
  { x: 55, y: 6, r: 3, dur: 8.5 },
  { x: 30, y: 28, r: -2, dur: 6.5 },
  { x: 72, y: 16, r: 6, dur: 9.0 },
  { x: 8, y: 52, r: -7, dur: 7.8 },
  { x: 48, y: 56, r: 4, dur: 8.2 },
  { x: 78, y: 48, r: -3, dur: 6.8 },
  { x: 25, y: 72, r: 5, dur: 9.5 },
];

export default function FloatingCloud({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.05 });
  const [hovered, setHovered] = useState(null);
  if (photos.length === 0) return null;

  return (
    <section ref={ref} style={{ height: "100vh", position: "relative", overflow: "hidden", background: "#000" }}>
      {photos.slice(0, 8).map((photo, i) => {
        const p = POSITIONS[i % POSITIONS.length];
        return (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={
              inView
                ? {
                    opacity: 0.88,
                    scale: 1,
                    y: hovered === i ? -16 : [0, -10, 0],
                  }
                : { opacity: 0, scale: 0.92, y: 24 }
            }
            transition={{
              opacity: { delay: 0.15 + i * 0.08, duration: 0.7, ease: "easeOut" },
              scale: { delay: 0.15 + i * 0.08, duration: 0.7, ease: "easeOut" },
              y: {
                duration: p.dur,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: i * 0.12,
              },
            }}
            style={{
              position: "absolute",
              top: `${p.y}%`,
              left: `${p.x}%`,
              width: "min(18rem, 40vw)",
              rotate: `${p.r}deg`,
              zIndex: hovered === i ? 20 : i + 1,
              cursor: "pointer",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onPhotoClick?.(photo)}
          >
            <PhotoCard
              photo={photo}
              onClick={onPhotoClick}
              aspect="4/5"
              tilt={false}
            />
          </motion.div>
        );
      })}
    </section>
  );
}
