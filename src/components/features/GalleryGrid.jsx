"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImmersiveLightbox from "./ImmersiveLightbox";

function TiltCard({ photo, index, onClick }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleMouse = useCallback((e) => {
    if (!cardRef.current) return;
    setHovered(true);
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: -y * 12, y: x * 12 });
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const handleLeave = useCallback(() => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlow({ x: 50, y: 50 });
  }, []);

  const seed = (index * 7.389) % 1;
  const dropY = -200 - seed * 250;
  const dropRotate = (seed - 0.5) * 24;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: dropY, rotate: dropRotate }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ type: "spring", stiffness: 180, damping: 14, mass: 0.8, delay: (index % 12) * 0.05 + 0.1 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={() => onClick(index)}
      className="relative cursor-pointer group perspective-[1000px]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-[rgba(10,10,10,0.9)] transition-all duration-200"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          boxShadow: `0 10px 40px rgba(0,0,0,0.4), 0 0 30px rgba(244,140,54,0.15)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(244,140,54,0.12) 0%, transparent 60%)`,
          }}
        />
        <div className="relative overflow-hidden bg-white/[0.02]">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(10,10,10,0.8)]">
              <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-a2 animate-spin" />
            </div>
          )}
          <img
            src={`${photo.url}?t=${photo.uploadedAt}`}
            alt=""
            onLoad={() => setLoaded(true)}
            className={`w-full h-64 md:h-80 object-cover transition-all duration-500 group-hover:scale-110 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <AnimatePresence>
            {photo.visibility === "private" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-3 left-3 z-20"
              >
                <span className="px-2 py-0.5 rounded-full bg-black/60 border border-a1/30 text-a1 text-[10px] font-mono backdrop-blur-sm">
                  &#128274; Private
                </span>
              </motion.div>
            )}
            {photo.visibility === "unlisted" && (
              <div className="absolute top-3 left-3 z-20">
                <span className="px-2 py-0.5 rounded-full bg-black/60 border border-white/20 text-white/40 text-[10px] font-mono backdrop-blur-sm">
                  &#128274; Unlisted
                </span>
              </div>
            )}
          </AnimatePresence>

          {photo.favorite && (
            <div className="absolute top-3 right-3 z-20">
              <span className="text-accent text-sm drop-shadow-lg">&#10029;</span>
            </div>
          )}
        </div>

        <div className="p-4 relative z-20">
          {photo.caption && (
            <p className="text-white/50 text-xs mt-0 line-clamp-1 group-hover:text-white/70 transition-colors">
              {photo.caption}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white/40 text-[10px] font-mono">
              {new Date(photo.uploadedAt).toLocaleDateString()}
            </span>
            {photo.tags?.length > 0 && (
              <span className="text-white/30 text-[10px] font-mono">
                {photo.tags.slice(0, 2).join(", ")}
                {photo.tags.length > 2 && "..."}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function GalleryGrid({ photos = [] }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40 text-xl font-display">No pictures found</p>
        <p className="text-white/30 text-sm mt-2">
          Try adjusting your filters or upload new photos
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {photos.map((photo, i) => (
          <div key={photo.id} className="break-inside-avoid mb-4">
            <TiltCard photo={photo} index={i} onClick={setLightboxIdx} />
          </div>
        ))}
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
