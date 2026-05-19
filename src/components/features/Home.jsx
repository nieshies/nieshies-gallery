"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import usePhotos from "@/hooks/usePhotos";
import Link from "next/link";
import GalleryGrid from "./GalleryGrid";

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
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(selected);
      });
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || selected.name, dataUrl })
      });
      if (!res.ok) throw new Error("Upload failed");
      setStatus("Uploaded ✓");
      setTimeout(() => { onUpload(); onClose(); }, 400);
    } catch { setStatus("Upload failed"); }
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
        className="relative max-w-md w-full p-6 rounded-2xl border border-white/15 bg-[rgba(17,17,17,0.95)] backdrop-blur-xl"
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

function FadeIn({ children, delay = 0, className = "" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { photos, reload } = usePhotos();
  const [showUpload, setShowUpload] = useState(false);
  const [bgIdx, setBgIdx] = useState(0);
  const [loaded, setLoaded] = useState({});

  const bgPhotos = photos.filter((p) => p.url);
  const hasPhotos = bgPhotos.length > 0;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const nextBg = useCallback(() => {
    if (bgPhotos.length < 2) return;
    setBgIdx((i) => (i + 1) % bgPhotos.length);
  }, [bgPhotos.length]);

  useEffect(() => {
    if (bgPhotos.length < 2) return;
    const id = setInterval(nextBg, 4500);
    return () => clearInterval(id);
  }, [nextBg, bgPhotos.length]);

  const currentPhoto = hasPhotos ? bgPhotos[bgIdx] : null;
  const nextPhoto = hasPhotos && bgPhotos.length > 1
    ? bgPhotos[(bgIdx + 1) % bgPhotos.length]
    : null;

  return (
    <>
      <section className="relative w-full h-screen overflow-hidden">
        {hasPhotos && (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhoto.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img
                  src={`${currentPhoto.url}?t=${currentPhoto.uploadedAt}`}
                  alt=""
                  className="w-full h-full object-cover"
                  onLoad={() => setLoaded((prev) => ({ ...prev, [currentPhoto.id]: true }))}
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30" />
          </>
        )}

        {!hasPhotos && (
          <div className="absolute inset-0 bg-[#0a0a0a]" />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/25 text-xs font-display uppercase tracking-[0.3em] mb-6"
          >
            A curated collection of moments
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="m-0 mb-2 font-display uppercase text-[clamp(3.5rem,14vw,10rem)] leading-[.82] tracking-tight"
          >
            <span className="block bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
              nieshies
            </span>
            <span className="block text-[clamp(2rem,8vw,5rem)] mt-[-0.06em] text-white/50 font-light">
              gallery
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex gap-3 flex-wrap justify-center mt-10"
          >
            <Link
              href="/products"
              className="px-6 py-2.5 rounded-full text-xs font-display font-bold uppercase tracking-[0.25em] transition-all duration-300"
              style={{
                backgroundColor: "rgba(244,140,54,0.12)",
                border: "1px solid rgba(244,140,54,0.3)",
                color: "#f48c36",
              }}
            >
              GALLERY
            </Link>
            <Link
              href="/amnie"
              className="px-6 py-2.5 rounded-full text-xs font-display font-bold uppercase tracking-[0.25em] transition-all duration-300"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              AMNIE
            </Link>
            <Link
              href="/family"
              className="px-6 py-2.5 rounded-full text-xs font-display font-bold uppercase tracking-[0.25em] transition-all duration-300"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              FAMILY
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-white/15 text-xs font-display uppercase tracking-[0.3em]">Scroll to discover</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-px h-6 bg-white/20" />
        </motion.div>
      </section>

      <section className="relative px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-display uppercase text-[clamp(1.8rem,5vw,3.5rem)] leading-[.92] text-white"
            >
              PHOTO <span className="text-accent">COLLECTION</span>
            </motion.h2>
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={() => setShowUpload(true)}
              className="w-12 h-12 rounded-full border-2 border-white/30 text-white/70 hover:text-white hover:border-accent/50 hover:bg-accent/10 text-2xl flex items-center justify-center transition-all flex-shrink-0"
              title="Add photo"
            >
              +
            </motion.button>
          </div>

          <FadeIn delay={0.2}>
            {photos.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/30 text-lg font-display">No photos yet</p>
                <p className="text-white/20 text-sm mt-1">Tap + to upload your first capture</p>
              </div>
            ) : (
              <GalleryGrid photos={photos} />
            )}
          </FadeIn>
        </div>
      </section>

      <AnimatePresence>
        {showUpload && <UploadLightbox onClose={() => setShowUpload(false)} onUpload={() => reload()} />}
      </AnimatePresence>
    </>
  );
}
