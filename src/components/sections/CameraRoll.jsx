"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";

function seeding(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function genPositions(count) {
  const r = seeding(42);
  return Array.from({ length: count }, (_, i) => ({
    rotate: (r() - 0.5) * 16,
    top: `${5 + r() * 80}%`,
    left: `${2 + r() * 76}%`,
    z: Math.floor(r() * count),
  }));
}

export default function CameraRoll({ photos }) {
  const positions = useMemo(() => genPositions(photos.length), [photos.length]);

  if (photos.length === 0) return null;

  return (
    <section className="relative py-16 overflow-hidden">
      <p className="text-white/20 text-[10px] font-display uppercase tracking-[0.3em] text-center mb-6">camera roll</p>
      <div className="relative h-[120vh] w-full max-w-5xl mx-auto">
        {photos.map((photo, i) => {
          const pos = positions[i] || {};
          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="absolute"
              style={{
                top: pos.top, left: pos.left,
                rotate: `${pos.rotate}deg`,
                zIndex: pos.z,
                width: "min(200px, 40vw)",
                aspectRatio: "4/5",
              }}
            >
              <div className="w-full h-full rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-lg">
                <img
                  src={`${photo.url}?t=${photo.uploadedAt}`}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
