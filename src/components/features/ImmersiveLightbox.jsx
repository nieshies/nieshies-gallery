"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";


function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function MagneticBtn({ children, className = "", ...props }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 150;
    if (dist > maxDist) { setOffset({ x: 0, y: 0 }); return; }
    const strength = 0.3;
    setOffset({ x: dx * strength, y: dy * strength });
  }, []);

  const handleLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return (
    <button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      {...props}
    >
      {children}
    </button>
  );
}

export default function ImmersiveLightbox({ photos, index, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(index);
  const [showMeta, setShowMeta] = useState(false);
  const [showExif, setShowExif] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const photo = photos[currentIdx];
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < photos.length - 1;

  const goNext = useCallback(() => {
    if (hasNext) { setLoaded(false); setCurrentIdx((i) => i + 1); }
  }, [hasNext]);

  const goPrev = useCallback(() => {
    if (hasPrev) { setLoaded(false); setCurrentIdx((i) => i - 1); }
  }, [hasPrev]);

  const handleBgMouse = useCallback((e) => {
    mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case "Escape": onClose(); break;
        case "ArrowRight": goNext(); break;
        case "ArrowLeft": goPrev(); break;
        case "i": case "I": setShowExif((v) => !v); break;
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  useEffect(() => {
    setShowExif(false);
  }, [currentIdx]);

  if (!photo) return null;

  const touchStart = { x: 0, y: 0 };
  const handleTouchStart = (e) => {
    touchStart.x = e.touches[0].clientX;
    touchStart.y = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      dx > 0 ? goPrev() : goNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleBgMouse}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full flex flex-col items-center justify-center"
      >
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <span className="text-white/30 text-xs font-mono">
            {currentIdx + 1} / {photos.length}
          </span>
          <button
            onClick={() => setShowMeta((v) => !v)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all text-xs"
            title="Toggle metadata"
          >
            &#8505;
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all text-lg"
          >
            &#10005;
          </button>
        </div>

        {hasPrev && (
          <MagneticBtn
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 text-lg backdrop-blur-md border border-white/[0.06]"
          >
            &#8592;
          </MagneticBtn>
        )}
        {hasNext && (
          <MagneticBtn
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 text-lg backdrop-blur-md border border-white/[0.06]"
          >
            &#8594;
          </MagneticBtn>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25 }}
            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
          >
            <div
              className="relative rounded-2xl"
              style={{
                boxShadow: loaded
                  ? `0 0 60px rgba(244,140,54,0.08), 0 0 120px rgba(255,179,71,0.04)`
                  : "none",
              }}
            >
              <img
                src={`${photo.url}?t=${photo.uploadedAt}`}
                alt=""
                onLoad={() => setLoaded(true)}
                className={`max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-2xl transition-all duration-700 ${
                  loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              />
              {loaded && (
                <div
                  className="absolute -inset-[1px] rounded-2xl opacity-40 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at ${mouseRef.current.x * 100}% ${mouseRef.current.y * 100}%, rgba(244,140,54,0.06) 0%, transparent 60%)`,
                    transition: "background 0.3s",
                  }}
                />
              )}
            </div>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-a2 animate-spin" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showMeta && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm"
            >
              <div className="flex flex-wrap items-start gap-4 justify-between">
                <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-20" style={{
                  background: `linear-gradient(135deg, rgba(244,140,54,0.05) 0%, transparent 50%, rgba(255,179,71,0.05) 100%)`,
                }} />
                <div className="space-y-1">
                  {photo.caption && (
                    <p className="text-white/80 text-sm">{photo.caption}</p>
                  )}
                  <p className="text-white/30 text-xs font-mono">
                    {new Date(photo.uploadedAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                  {photo.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {photo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-[10px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowExif((v) => !v)}
                  className="px-3 py-1 rounded-full border border-white/15 text-white/40 text-[10px] font-mono hover:border-white/30 hover:text-white/70 transition-all"
                >
                  {showExif ? "Hide details" : "Show details"}
                </button>
              </div>

              <AnimatePresence>
                {showExif && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 pt-3 border-t border-white/10 text-[11px] text-white/40 font-mono">
                      <span>Name: {photo.filename}</span>
                      <span>Size: {formatBytes(photo.sizeBytes)}</span>
                      <span>ID: {photo.id.slice(0, 8)}</span>
                      {photo.visibility && <span>Visibility: {photo.visibility}</span>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onMouseEnter={() => setShowMeta(true)}
          onMouseLeave={() => { if (!showExif) setShowMeta(false); }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/40 text-xs transition-all opacity-0 hover:opacity-100"
        >
          &#9660;
        </button>
      </div>
    </motion.div>
  );
}
