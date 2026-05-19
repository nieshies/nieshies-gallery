"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROTATIONS = [-6, -4, -2, 0, 2, 4, 6, 8, -8, -3, 3, 7];

function randRot() {
  return ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
}

function randOffset() {
  return Math.random() * 8 - 4;
}

function PolaroidCard({ memory, index, onClick }) {
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const rotation = useRef(randRot());
  const offset = useRef(randOffset());

  const handleMouse = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.03, 0.4) }}
      className="inline-block cursor-pointer group"
      style={{
        margin: "12px 8px",
        transform: `rotate(${rotation.current}deg) translateY(${offset.current}px)`,
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouse}
        onClick={() => onClick(memory)}
        className="relative overflow-hidden transition-all duration-300"
        style={{
          width: "min(220px, 42vw)",
          background: "var(--glass)",
          backdropFilter: "blur(12px)",
          borderRadius: 16,
          border: "1px solid var(--glass-border)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
          transform: `perspective(900px) rotateX(${(pos.y - 0.5) * 4}deg) rotateY(${(pos.x - 0.5) * 4}deg)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${pos.x * 100}% ${pos.y * 100}%, rgba(244,140,54,0.22), transparent 42%)`,
          }}
        />
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
          <img
            src={memory.photoUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {memory.description && (
            <p className="absolute bottom-0 left-0 right-0 p-3 text-[11px] text-white/90 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {memory.description}
            </p>
          )}
        </div>
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
    if (!photoFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", photoFile);
      formData.append("description", description.trim());
      const res = await fetch("/api/amnie", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        onAdd(data.memory);
      }
      onClose();
    } catch {
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
        className="relative w-full max-w-md rounded-2xl glass-panel shadow-glass p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="m-0 font-display uppercase text-lg tracking-wider text-[var(--text-primary)]">
            new memory
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white/50">
            &#10005;
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5 text-[var(--text-secondary)]">
              Photo
            </p>
            <label className="block w-full border-2 border-dashed rounded-xl p-5 text-center cursor-pointer hover:opacity-80 transition-opacity"
              style={{ borderColor: "var(--border-color)" }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="" className="max-h-32 mx-auto rounded-lg object-contain" />
              ) : (
                <div>
                  <svg className="w-6 h-6 mx-auto mb-1 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[11px] font-mono text-[var(--text-secondary)]">tap to add a photo</p>
                </div>
              )}
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5 text-[var(--text-secondary)]">
              Caption
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="a moment worth keeping..."
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
            disabled={!photoFile || uploading}
            className="w-full py-3 rounded-xl font-display uppercase tracking-wider text-sm transition-all disabled:opacity-30 text-white"
            style={{
              background: !photoFile || uploading ? "rgba(255,255,255,0.1)" : "var(--accent)",
            }}
          >
            {uploading ? "saving..." : "add to dump"}
          </button>
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

        <div className="overflow-hidden rounded-2xl glass-panel shadow-glass"
          style={{ padding: "8px" }}
        >
          {memory.photoUrl && (
            <div className="relative overflow-hidden rounded-xl bg-black/20">
              <img
                src={memory.photoUrl}
                alt=""
                className="w-full object-contain"
                style={{ maxHeight: "60vh" }}
              />
            </div>
          )}

          {memory.description && (
            <div className="p-4 text-center">
              <p className="text-sm leading-relaxed text-white/80" style={{ fontFamily: "var(--font-sans)" }}>
                {memory.description}
              </p>
              <p className="text-[10px] font-mono mt-2 text-white/30">
                {memory.date}
              </p>
            </div>
          )}
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

export default function AmnieDump() {
  const [memories, setMemories] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const loaderRef = useRef(null);

  const fetchMemories = useCallback(async (reset = false) => {
    try {
      const params = new URLSearchParams({ limit: "24" });
      if (!reset && cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/amnie?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      if (reset) {
        setMemories(data.items);
      } else {
        setMemories((prev) => [...prev, ...data.items]);
      }
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch {} finally {
      setLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    fetchMemories(true);
  }, []);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMemories();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchMemories]);

  const addMemory = useCallback((memory) => {
    setMemories((prev) => [memory, ...prev]);
  }, []);

  const deleteMemory = useCallback(async (id) => {
    try {
      await fetch(`/api/amnie/${id}`, { method: "DELETE" });
      setMemories((prev) => prev.filter((m) => m.id !== id));
      setViewing(null);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="pt-24 pb-24 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-accent/60 text-xs font-display uppercase tracking-[0.3em] mb-2">amnie</p>
          <h1 className="font-display uppercase text-[clamp(2.2rem,8vw,4rem)] leading-[.9] tracking-tight text-white">
            memory dump
          </h1>
          <p className="text-sm text-white/40 max-w-md mx-auto mt-3 font-[family-name:var(--font-sans)]">
            scattered moments, frozen in time
          </p>
        </motion.div>

        <div className="text-center">
          {memories.map((memory, i) => (
            <PolaroidCard key={memory.id} memory={memory} index={i} onClick={setViewing} />
          ))}
        </div>

        <div ref={loaderRef} className="h-10 flex items-center justify-center mt-4">
          {loading && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/20">loading...</span>
          )}
          {!hasMore && memories.length > 0 && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/15">no more memories</span>
          )}
        </div>

        {memories.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <div className="inline-block rounded-2xl p-8 glass-panel shadow-glass">
              <p className="text-4xl mb-3">&#x1F4F8;</p>
              <p className="font-display text-lg tracking-wider text-white/50">
                dump is empty
              </p>
              <p className="text-sm mt-1 text-white/30 font-[family-name:var(--font-sans)]">
                tap + to add your first polaroid
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-white text-2xl"
        style={{ background: "var(--accent)" }}
      >
        +
      </motion.button>

      <AnimatePresence>
        {showAdd && <AddMemoryModal onClose={() => setShowAdd(false)} onAdd={addMemory} />}
        {viewing && (
          <ViewMemoryModal
            memory={viewing}
            onClose={() => setViewing(null)}
            onDelete={deleteMemory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
