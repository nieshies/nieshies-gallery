"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ParallaxLayers({ photos }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  if (photos.length === 0) return null;

  const layers = photos.slice(0, 3);

  return (
    <section ref={ref} className="relative h-[180vh] overflow-hidden">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {layers.map((photo, i) => {
          const y = useTransform(scrollYProgress, [0, 1], [i * 30, -i * 30]);
          const scale = 1 + i * 0.05;
          return (
            <motion.div
              key={photo.id}
              style={{ y, scale }}
              className="absolute inset-0"
            >
              <img
                src={`${photo.url}?t=${photo.uploadedAt}`}
                alt=""
                className="w-full h-full object-cover"
                style={{ opacity: 1 - i * 0.15 }}
              />
            </motion.div>
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
      </div>
    </section>
  );
}
