"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import usePhotos from "@/hooks/usePhotos";
import ScatteredGallery from "./ScatteredGallery";

function UploadLightbox({ onClose, onUpload }) {
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelected(file);
      if (!name) setName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!selected) return;
    setStatus("Uploading...");
    try {
      const fd = new FormData();
      fd.append("file", selected);
      fd.append("name", name);
      const res = await fetch("/api/photos", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      setStatus("Uploaded ✓");
      setTimeout(() => { onUpload(); onClose(); }, 400);
    } catch (e) { setStatus(e.message); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full p-6 rounded-2xl border border-white/15 bg-[rgba(10,10,10,0.95)] backdrop-blur-xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white text-lg">&#10005;</button>
        <p className="text-white/60 text-lg font-display uppercase tracking-widest mb-6">ADD PHOTO</p>
        <div className="space-y-4">
          <div>
            <p className="text-white/30 text-xs font-display uppercase tracking-[0.2em] mb-2">Photo</p>
            <label className="block w-full border-2 border-dashed border-white/25 rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 transition-colors">
              {selected ? (
                <p className="text-accent text-sm font-display">{selected.name}</p>
              ) : (
                <p className="text-white/40 text-sm font-display">Click to select a photo</p>
              )}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-white/30 text-xs font-display uppercase tracking-[0.2em] mb-2">Name</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Photo name"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-base outline-none focus:border-accent/40 placeholder:text-white/20" />
          </div>
          {status && <p className="text-accent text-sm text-center">{status}</p>}
          <button onClick={handleUpload} disabled={!selected}
            className="w-full py-3 rounded-xl border border-accent/40 text-accent text-sm font-display uppercase tracking-widest hover:bg-accent/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            UPLOAD
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PhotoReel({ photos }) {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const speedRef = useRef(0.6);

  const doubled = [...photos, ...photos];

  useEffect(() => {
    if (paused || photos.length === 0) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    const step = () => {
      if (!trackRef.current) return;
      const halfW = trackRef.current.scrollWidth / 2;
      if (halfW <= 0) return;
      posRef.current -= speedRef.current;
      if (Math.abs(posRef.current) >= halfW) {
        posRef.current += halfW;
      }
      trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [paused, photos.length]);

  if (photos.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden cursor-pointer select-none"
      onClick={() => setPaused((p) => !p)}
    >
      <div
        ref={trackRef}
        className="flex gap-4"
        style={{ willChange: "transform" }}
      >
        {doubled.map((photo, i) => (
          <div
            key={`${photo.id}-${i}`}
            className="relative flex-shrink-0 overflow-hidden rounded-xl"
            style={{ width: 280, height: 360 }}
          >
            <img
              src={`${photo.url}?t=${photo.uploadedAt}`}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white/80 text-sm font-display leading-tight line-clamp-2">
                {photo.caption || photo.name || " "}
              </p>
            </div>
          </div>
        ))}
      </div>
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/60 text-sm font-display uppercase tracking-[0.25em]"
          >
            paused  tap to continue
          </motion.p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { photos, reload } = usePhotos();
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 pt-28 pb-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white/20 text-xs font-display uppercase tracking-[0.3em] mb-3"
              >
                Random Memories
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="font-display uppercase text-[clamp(2.5rem,8vw,5rem)] leading-[.88] tracking-tight"
              >
                <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                  nieshies
                </span>
                <span className="block text-white/40 text-[clamp(1.2rem,4vw,2.5rem)] font-light mt-[-0.04em]">
                  gallery
                </span>
              </motion.h1>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              onClick={() => setShowUpload(true)}
              className="flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-display font-bold uppercase tracking-[0.2em] transition-all duration-300"
              style={{
                backgroundColor: "rgba(244,140,54,0.1)",
                border: "1px solid rgba(244,140,54,0.25)",
                color: "#f48c36",
              }}
            >
              Add Photos
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <PhotoReel photos={photos} />
          </motion.div>
        </div>
      </section>

      <section className="relative px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {photos.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/30 text-lg font-display">No photos yet</p>
                <p className="text-white/20 text-sm mt-1">Tap + to upload your first capture</p>
              </div>
            ) : (
              <ScatteredGallery photos={photos} />
            )}
          </motion.div>

          {photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <p className="text-white/15 text-xs font-mono tracking-wider">
                more memories soon.
              </p>
              <div className="w-8 h-px bg-white/10 mx-auto mt-4" />
            </motion.div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {showUpload && <UploadLightbox onClose={() => setShowUpload(false)} onUpload={() => reload()} />}
      </AnimatePresence>
    </>
  );
}
