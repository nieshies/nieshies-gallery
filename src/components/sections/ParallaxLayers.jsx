"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ParallaxLayers({ photos }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y0 = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const y1 = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const y2 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yVals = [y0, y1, y2];

  if (photos.length === 0) return null;

  const layers = photos.slice(0, 3);

  return (
    <section ref={ref} className="content-section relative h-[180vh] overflow-hidden">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {layers.map((photo, i) => (
          <motion.div
            key={photo.id}
            style={{ y: yVals[i], scale: 1 + i * 0.05 }}
            className="absolute inset-0"
          >
            <img
              src={`${photo.url}?t=${photo.uploadedAt}`}
              alt=""
              className="w-full h-full object-cover"
              style={{ opacity: 1 - i * 0.15 }}
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
      </div>
    </section>
  );
}
