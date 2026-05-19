"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";

function seeding(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function genPositions(count) {
  const r = seeding(99);
  return Array.from({ length: count }, (_, i) => ({
    rotate: (r() - 0.5) * 24,
    top: `${3 + r() * 84}%`,
    left: `${2 + r() * 86}%`,
    z: Math.floor(r() * count),
  }));
}

export default function FloatingCloud({ photos }) {
  const positions = useMemo(() => genPositions(photos.length), [photos.length]);

  if (photos.length === 0) return null;

  return (
    <section className="content-section relative py-16 overflow-hidden">
      <p className="text-white/20 text-[10px] font-display uppercase tracking-[0.3em] text-center mb-6">floating</p>
      <div className="relative h-[100vh] w-full max-w-6xl mx-auto">
        {photos.map((photo, i) => {
          const pos = positions[i] || {};
          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="absolute"
              style={{
                top: pos.top, left: pos.left,
                rotate: `${pos.rotate}deg`,
                zIndex: pos.z,
                width: "min(160px, 35vw)",
                aspectRatio: "1/1",
              }}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-lg backdrop-blur-sm">
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
