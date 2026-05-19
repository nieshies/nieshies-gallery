"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

const POSITIONS = [
  { x: 2, y: 2, w: 220, h: 290, r: -4, dur: 7.0 },
  { x: 48, y: 4, w: 190, h: 250, r: 3, dur: 8.5 },
  { x: 28, y: 20, w: 170, h: 230, r: -2, dur: 6.5 },
  { x: 72, y: 12, w: 200, h: 270, r: 5, dur: 9.0 },
  { x: 5, y: 44, w: 240, h: 320, r: -6, dur: 7.8 },
  { x: 42, y: 50, w: 210, h: 280, r: 4, dur: 8.2 },
  { x: 75, y: 46, w: 180, h: 240, r: -3, dur: 6.8 },
  { x: 15, y: 68, w: 160, h: 210, r: 6, dur: 9.5 },
  { x: 55, y: 72, w: 230, h: 300, r: -5, dur: 7.2 },
  { x: 82, y: 62, w: 150, h: 200, r: 7, dur: 8.8 },
];

export default function ParallaxLayers({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.05 });
  const [hovered, setHovered] = useState(null);
  if (photos.length === 0) return null;

  return (
    <section ref={ref} style={{ height: "100vh", position: "relative", overflow: "hidden", background: "#000" }}>
      {photos.slice(0, 10).map((photo, i) => {
        const p = POSITIONS[i % POSITIONS.length];
        return (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={
              inView
                ? {
                    opacity: 0.85,
                    scale: 1,
                    y: hovered === i ? -12 : [0, -8, 0],
                  }
                : { opacity: 0, scale: 0.92, y: 20 }
            }
            transition={{
              opacity: { delay: 0.1 + i * 0.06, duration: 0.7, ease: "easeOut" },
              scale: { delay: 0.1 + i * 0.06, duration: 0.7, ease: "easeOut" },
              y: {
                duration: p.dur,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: i * 0.15,
              },
            }}
            style={{
              position: "absolute",
              top: `${p.y}%`,
              left: `${p.x}%`,
              width: p.w,
              height: p.h,
              rotate: `${p.r}deg`,
              zIndex: hovered === i ? 20 : i + 1,
              cursor: "pointer",
              borderRadius: 4,
              overflow: "hidden",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onPhotoClick?.(photo)}
          >
            <PhotoCard photo={photo} onClick={onPhotoClick} aspect="4/5" tilt={false} />
          </motion.div>
        );
      })}
    </section>
  );
}
