"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CinematicViewer({ photos }) {
  const [idx, setIdx] = useState(0);

  const next = useCallback(() => setIdx((i) => (i + 1) % photos.length), [photos.length]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);

  if (photos.length === 0) return null;

  const photo = photos[idx];

  return (
    <section className="content-section relative py-16 overflow-hidden">
      <p className="text-white/20 text-[10px] font-display uppercase tracking-[0.3em] text-center mb-6">cinematic</p>
      <div className="flex items-center justify-center gap-4 px-4">
        {photos.length > 1 && (
          <button onClick={prev} className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors text-lg">&#8592;</button>
        )}
        <div className="relative overflow-hidden rounded-2xl" style={{ width: "min(94vw, 30rem)", aspectRatio: "3/4" }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={photo.id}
              src={`${photo.url}?t=${photo.uploadedAt}`}
              alt=""
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>
        {photos.length > 1 && (
          <button onClick={next} className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors text-lg">&#8594;</button>
        )}
      </div>
      <p className="text-white/20 text-xs font-mono text-center mt-4">{idx + 1} / {photos.length}</p>
    </section>
  );
}
