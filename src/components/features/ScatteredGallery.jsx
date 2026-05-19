"use client";
import { useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImmersiveLightbox from "./ImmersiveLightbox";

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generatePile(count) {
  const rand = seededRandom(42);
  const positions = [];
  const SPREAD = 130;
  const VERTICAL_RANGE = 130;
  const ROTATION_RANGE = 8;

  for (let i = 0; i < count; i++) {
    const xOffset = (rand() - 0.5) * 50;
    positions.push({
      rotate: (rand() - 0.5) * 2 * ROTATION_RANGE,
      x: i * SPREAD + xOffset,
      y: (rand() - 0.5) * VERTICAL_RANGE,
      z: Math.floor(rand() * count),
    });
  }
  return positions;
}

export default function ScatteredGallery({ photos = [] }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const scrollRef = useRef(null);

  const pile = useMemo(() => generatePile(photos.length), [photos.length]);

  const handleClick = useCallback((idx) => {
    setLightboxIdx(idx);
  }, []);

  if (photos.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-secondary)] text-xl font-display">
          No pictures found
        </p>
        <p className="text-[var(--text-secondary)] text-sm mt-2">
          Upload photos to see them in the pile
        </p>
      </div>
    );
  }

  const pileWidth = Math.max(photos.length * 130 + 200, 800);

  return (
    <>
      <div
        ref={scrollRef}
        className="relative w-full overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ height: 480, scrollbarWidth: "thin" }}
      >
        <div
          className="relative h-full"
          style={{ width: pileWidth }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <AnimatePresence mode="popLayout">
              {photos.map((photo, i) => {
                const pos = pile[i] || { rotate: 0, x: 0, y: 0, z: 0 };
                const isHovered = hoveredId === photo.id;

                return (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.7, rotate: pos.rotate }}
                    animate={{
                      opacity: isHovered ? 1 : 0.85,
                      scale: isHovered ? 1.12 : 1,
                      rotate: isHovered ? 0 : pos.rotate,
                      x: pos.x,
                      y: pos.y,
                    }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{
                      type: "spring",
                      stiffness: isHovered ? 350 : 180,
                      damping: isHovered ? 25 : 20,
                      mass: isHovered ? 0.8 : 1,
                      delay: i * 0.025,
                    }}
                    onMouseEnter={() => setHoveredId(photo.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleClick(i)}
                    className="absolute cursor-pointer"
                    style={{
                      zIndex: isHovered ? 999 : pos.z,
                      left: "50%",
                      top: "50%",
                    }}
                  >
                    <motion.div
                      layout
                      animate={{
                        boxShadow: isHovered
                          ? "0 30px 80px rgba(0,0,0,0.45), 0 10px 30px rgba(0,0,0,0.2)"
                          : "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                      transition={{ duration: 0.3 }}
                      className="rounded-sm overflow-hidden"
                      style={{
                        width: 200,
                        background: "#fff",
                        padding: "10px 10px 50px 10px",
                      }}
                    >
                      <div className="relative overflow-hidden bg-neutral-100">
                        <img
                          src={`${photo.url}?t=${photo.uploadedAt}`}
                          alt=""
                          className="w-full object-cover"
                          style={{ height: 200 }}
                          loading="lazy"
                          draggable={false}
                        />
                      </div>

                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 28, opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-[10px] text-neutral-500 font-mono leading-none pt-1.5 truncate text-center">
                              {photo.caption || new Date(photo.uploadedAt).toLocaleDateString()}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <span className="text-[10px] font-mono tracking-wider uppercase" style={{ color: "var(--text-secondary)" }}>
          &#8592; Scroll to explore &middot; {photos.length} memories &middot; &#8594;
        </span>
      </div>

      <AnimatePresence mode="wait">
        {lightboxIdx !== null && (
          <ImmersiveLightbox
            photos={photos}
            index={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
