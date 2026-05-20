"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/ThemeContext";
import { getPhotoUrl } from "@/utils/photo";

const SPREAD_SIZE = 4;
const STORAGE_KEY = "nieshies-amnie-memories";

function PolaroidCard({ memory, index, onClick, total }) {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={() => onClick(memory)}
      className="cursor-pointer group perspective-[800px]"
    >
      <div
        className="rounded-sm overflow-hidden transition-all duration-300 mx-auto"
        style={{
          width: "100%",
          maxWidth: 260,
          background: "#fff",
          padding: "12px 12px 48px 12px",
          boxShadow: theme === "light"
            ? "0 2px 8px rgba(0,0,0,0.08)"
            : "0 4px 16px rgba(0,0,0,0.25)",
        }}
      >
        <div className="relative overflow-hidden bg-neutral-100 rounded-sm">
          {memory.photoUrl ? (
            <img
              src={getPhotoUrl(memory.photoUrl, "thumb")}
              alt=""
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ aspectRatio: "4/3" }}
              loading="lazy"
            />
          ) : (
            <div
              className="w-full flex items-center justify-center"
              style={{ aspectRatio: "4/3", background: theme === "light" ? "#f0f0f0" : "#2a2a3a" }}
            >
              <span className="text-3xl opacity-30">&#x1F5BC;</span>
            </div>
          )}
        </div>
        <p
          className="text-[11px] leading-snug text-center font-[family-name:var(--font-sans)]"
          style={{
            color: "#666",
            marginTop: 10,
            fontStyle: "italic",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {memory.description || "a memory worth keeping"}
        </p>
      </div>
    </motion.div>
  );
}

function AddMemoryModal({ onClose, onAdd }) {
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    const r = new FileReader();
    r.onload = () => setPhotoPreview(r.result);
    r.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!description.trim() && !photoFile) return;
    setUploading(true);
    try {
      let photoUrl = null;
      if (photoPreview) {
        const res = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: photoFile.name,
            dataUrl: photoPreview,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          photoUrl = data.photo?.url || photoPreview;
        } else {
          photoUrl = photoPreview;
        }
      }
      onAdd({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        description: description.trim(),
        photoUrl,
        date: new Date().toISOString().split("T")[0],
      });
      onClose();
    } catch {
      onAdd({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        description: description.trim() || "a memory",
        photoUrl: photoPreview,
        date: new Date().toISOString().split("T")[0],
      });
      onClose();
    }
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[rgba(18,18,24,0.96)] dark:bg-[rgba(18,18,24,0.96)]"
        style={{
          background: "var(--bg-secondary, rgba(18,18,24,0.96))",
          borderColor: "var(--border-color, rgba(255,255,255,0.1))",
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="m-0 font-display uppercase text-lg tracking-wider" style={{ color: "var(--text-primary)" }}>
              new memory <span className="text-pink-300">&#10047;</span>
            </h2>
            <button onClick={onClose} className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "var(--text-secondary)" }}>
              &#10005;
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Photo
              </p>
              <label className="block w-full border-2 border-dashed rounded-xl p-5 text-center cursor-pointer hover:opacity-80 transition-opacity"
                style={{ borderColor: "var(--border-color)" }}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="max-h-32 mx-auto rounded-lg object-contain" />
                ) : (
                  <div>
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-secondary)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[11px] font-mono" style={{ color: "var(--text-secondary)" }}>tap to add a photo</p>
                  </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Description
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="what happened today?"
                rows={3}
                className="w-full rounded-xl p-3 text-sm outline-none resize-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                autoFocus
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={(!description.trim() && !photoFile) || uploading}
              className="w-full py-3 rounded-xl font-display uppercase tracking-wider text-sm transition-all disabled:opacity-30"
              style={{
                background: "linear-gradient(135deg, #ff3af2, #ff6b35)",
                color: "#fff",
                opacity: (!description.trim() && !photoFile) || uploading ? 0.3 : 1,
              }}
            >
              {uploading ? "saving..." : "save this moment &#10047;"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ViewMemoryModal({ memory, onClose, onDelete }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, rotateZ: -2 }}
        animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
        exit={{ scale: 0.85, opacity: 0, rotateZ: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative"
        style={{ maxWidth: 500, width: "100%" }}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/50 hover:text-white z-10 text-sm font-mono transition-colors"
        >
          &#10005; close
        </button>

        <div
          className="rounded-sm overflow-hidden"
          style={{
            background: "#fff",
            padding: "16px 16px 56px 16px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          }}
        >
          {memory.photoUrl ? (
            <div className="relative overflow-hidden bg-neutral-100 rounded-sm">
              <img
                src={getPhotoUrl(memory.photoUrl, "full")}
                alt=""
                className="w-full object-contain"
                style={{ maxHeight: "55vh" }}
              />
            </div>
          ) : (
            <div className="w-full flex items-center justify-center bg-neutral-100" style={{ height: 200 }}>
              <span className="text-5xl opacity-30">&#x1F5BC;</span>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-[13px] leading-relaxed" style={{ color: "#555", fontStyle: "italic" }}>
              {memory.description || "a memory worth keeping"}
            </p>
            <p className="text-[10px] font-mono mt-2" style={{ color: "#999" }}>
              {memory.date}
            </p>
          </div>
        </div>

        {onDelete && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => { if (confirm("delete this memory?")) onDelete(memory.id); }}
              className="text-[11px] font-mono uppercase tracking-wider px-4 py-2 rounded-full border border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all"
            >
              &#128465; delete
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function AlbumSpread({ memories, spreadIndex, onCardClick }) {
  const start = spreadIndex * SPREAD_SIZE;
  const slice = memories.slice(start, start + SPREAD_SIZE);
  const slots = Array.from({ length: SPREAD_SIZE }, (_, i) => slice[i] || null);

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6 w-full px-2">
      {slots.map((mem, i) => (
        <div key={mem?.id || `empty-${i}`} className="flex justify-center">
          {mem ? (
            <PolaroidCard memory={mem} index={i} onClick={onCardClick} total={SPREAD_SIZE} />
          ) : (
            <div
              className="rounded-sm border-2 border-dashed w-full flex items-center justify-center transition-colors"
              style={{
                maxWidth: 260,
                aspectRatio: "3/4",
                borderColor: "var(--border-color)",
                opacity: 0.3,
              }}
            >
              <span className="text-2xl" style={{ color: "var(--text-secondary)" }}>&#43;</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AmnieAlbum() {
  const { theme } = useTheme();
  const [memories, setMemories] = useState([]);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [viewingMemory, setViewingMemory] = useState(null);
  const [direction, setDirection] = useState(0);
  const scrollRef = useRef(null);

  const totalSpreads = Math.max(1, Math.ceil(memories.length / SPREAD_SIZE));
  const hasPrev = spreadIndex > 0;
  const hasNext = spreadIndex < totalSpreads - 1;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMemories(parsed);
        }
      }
    } catch {}
  }, []);

  const persist = useCallback((updated) => {
    setMemories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const maxSpread = Math.max(0, Math.ceil(updated.length / SPREAD_SIZE) - 1);
    setSpreadIndex((prev) => Math.min(prev, maxSpread));
  }, []);

  const addMemory = useCallback((m) => {
    const updated = [m, ...memories];
    persist(updated);
    setSpreadIndex(0);
  }, [memories, persist]);

  const deleteMemory = useCallback((id) => {
    const updated = memories.filter((m) => m.id !== id);
    persist(updated);
    setViewingMemory(null);
  }, [memories, persist]);

  const goNext = useCallback(() => {
    if (hasNext) { setDirection(1); setSpreadIndex((i) => i + 1); }
  }, [hasNext]);

  const goPrev = useCallback(() => {
    if (hasPrev) { setDirection(-1); setSpreadIndex((i) => i - 1); }
  }, [hasPrev]);

  const swipeHandlers = useCallback((e) => {
    const startX = e.changedTouches?.[0]?.clientX ?? e.clientX;
    const handler = (ev) => {
      const endX = ev.changedTouches?.[0]?.clientX ?? ev.clientX;
      const dx = endX - startX;
      if (Math.abs(dx) > 60) {
        dx > 0 ? goPrev() : goNext();
      }
      document.removeEventListener("mouseup", handler);
      document.removeEventListener("touchend", handler);
    };
    document.addEventListener("mouseup", handler, { once: true });
    document.addEventListener("touchend", handler, { once: true });
  }, [goNext, goPrev]);

  return (
    <div className="min-h-screen relative">
      <div className="pt-20 pb-24 px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <p className="text-pink-300/50 text-xs font-display uppercase tracking-[0.3em] mb-3">amnie</p>
          <h1 className="font-display uppercase text-[clamp(2.2rem,8vw,4rem)] leading-[.9] tracking-tight mb-3">
            <span className="bg-gradient-to-r from-pink-300 via-pink-200 to-pink-400 bg-clip-text text-transparent">
              our polaroid album
            </span>
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            every picture holds a smile. every memory has your name on it.
          </p>
        </motion.div>

        {memories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="inline-block rounded-2xl p-8 mb-4" style={{
              background: "var(--bg-secondary)",
              border: "2px dashed var(--border-color)",
            }}>
              <p className="text-4xl mb-3">&#x1F4F8;</p>
              <p className="font-display text-lg tracking-wider" style={{ color: "var(--text-primary)" }}>
                the album is empty
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                tap + to add your first polaroid
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={goPrev}
                disabled={!hasPrev}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
                style={{
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                &#8592;
              </button>

              <span className="text-[11px] font-mono tracking-wider" style={{ color: "var(--text-secondary)" }}>
                {spreadIndex + 1} / {totalSpreads}
              </span>

              <button
                onClick={goNext}
                disabled={!hasNext}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
                style={{
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                &#8594;
              </button>
            </div>

            <div
              ref={scrollRef}
              onMouseDown={swipeHandlers}
              onTouchStart={swipeHandlers}
              className="select-none"
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={spreadIndex}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 200 : -200 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -200 : 200 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.9 }}
                >
                  <AlbumSpread
                    memories={memories}
                    spreadIndex={spreadIndex}
                    onCardClick={setViewingMemory}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-1.5 mt-6">
              {Array.from({ length: totalSpreads }, (_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > spreadIndex ? 1 : -1); setSpreadIndex(i); }}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background: i === spreadIndex
                      ? "var(--text-primary)"
                      : "var(--border-color)",
                    width: i === spreadIndex ? 20 : 6,
                  }}
                />
              ))}
            </div>
          </>
        )}

        <div className="flex justify-center mt-10">
          <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
            {memories.length} memory{memories.length !== 1 ? "ies" : "y"} in this album
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-white text-2xl"
        style={{
          background: "linear-gradient(135deg, #ff3af2, #ff6b35)",
        }}
      >
        +
      </motion.button>

      <AnimatePresence>
        {showAdd && <AddMemoryModal onClose={() => setShowAdd(false)} onAdd={addMemory} />}
        {viewingMemory && (
          <ViewMemoryModal
            memory={viewingMemory}
            onClose={() => setViewingMemory(null)}
            onDelete={deleteMemory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
