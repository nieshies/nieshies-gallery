"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function TiltCard({ photo, index, onClick }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const handleMouse = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: -y * 12, y: x * 12 });
    setGlow({ x: (e.clientX - rect.left) / rect.width * 100, y: (e.clientY - rect.top) / rect.height * 100 });
  }, []);

  const handleLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setGlow({ x: 50, y: 50 });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: (index % 12) * 0.06 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={() => onClick(photo)}
      className="relative cursor-pointer group perspective-[1000px]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="relative rounded-2xl overflow-hidden border-2 border-white/15 bg-[rgba(10,10,10,0.9)] transition-all duration-200"
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
        <div className="relative overflow-hidden">
          <img
            src={`${photo.url}?t=${photo.uploadedAt}`}
            alt=""
            className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4 relative z-20">
          {photo.caption && (
            <p className="text-white/50 text-xs mt-1 line-clamp-1">{photo.caption}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-accent text-xs">{photo.favorite ? "♥" : "♡"}</span>
            <span className="text-white/30 text-[10px] font-mono">
              {new Date(photo.uploadedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Lightbox({ photo, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] w-full"
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/70 text-2xl hover:text-white z-10"
        >
          &#10005;
        </button>
        <img
          src={`${photo.url}?t=${photo.uploadedAt}`}
          alt=""
          className="w-full h-full object-contain rounded-2xl"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
          {photo.caption && <p className="text-white/70 text-sm">{photo.caption}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PictureGallery({ photos = [] }) {
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const sorted = [...photos].sort((a, b) => b.uploadedAt - a.uploadedAt);

  return (
    <div className="space-y-6">
      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-xl font-display">No pictures yet</p>
          <p className="text-white/30 text-sm mt-2">Upload your first photo to see it here</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {sorted.map((photo, i) => (
            <div key={photo.id} className="break-inside-avoid mb-4">
              <TiltCard photo={photo} index={i} onClick={setLightboxPhoto} />
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxPhoto && (
          <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
