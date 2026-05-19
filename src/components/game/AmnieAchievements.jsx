"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "nieshies-amnie-achievements";
const MAX_PHOTOS = 5;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function save(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      alert("Storage almost full \u2014 try using smaller photos.");
    }
  }
}

function fmt(d) {
  if (!d) return "";
  const p = new Date(d + "T00:00:00");
  return p.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function readFile(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });
}

function compress(dataUrl, maxW = 800) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > maxW) {
        h = (h * maxW) / w;
        w = maxW;
      }
      c.width = w;
      c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.src = dataUrl;
  });
}

function AchievementCard({ achievement, onClick }) {
  const photos = achievement.photos || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      onClick={() => onClick(achievement)}
      className="flex-shrink-0 snap-start w-[210px] rounded-xl p-4 cursor-pointer group"
      style={{
        background: "linear-gradient(145deg, rgba(255,105,180,0.04), rgba(255,182,193,0.02))",
        border: "1px solid rgba(255,105,180,0.1)",
      }}
    >
      <div className="flex justify-center mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,105,180,0.1))",
            border: "1px solid rgba(255,215,0,0.2)",
          }}
        >
          {"\uD83C\uDFC6"}
        </div>
      </div>

      <h3
        className="font-display text-sm font-bold text-center leading-snug mb-1 line-clamp-2"
        style={{
          background: "linear-gradient(135deg, #ffb6c1, #ff69b4, #ffd700)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {achievement.title}
      </h3>

      <p
        className="text-[10px] font-mono text-center mb-2"
        style={{ color: "rgba(255,105,180,0.4)" }}
      >
        {fmt(achievement.date)}
      </p>

      {photos.length > 0 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {photos.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-md overflow-hidden ring-1 ring-white/10"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {photos.length > 3 && (
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-mono"
              style={{ backgroundColor: "rgba(255,105,180,0.08)", color: "rgba(255,105,180,0.4)" }}
            >
              +{photos.length - 3}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function AddCard({ onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="flex-shrink-0 snap-start w-[210px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer group"
      style={{
        borderColor: "rgba(255,105,180,0.15)",
        minHeight: 240,
        backgroundColor: "rgba(255,105,180,0.02)",
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 transition-all duration-200 group-hover:scale-110"
        style={{
          backgroundColor: "rgba(255,105,180,0.06)",
          color: "rgba(255,105,180,0.4)",
        }}
      >
        +
      </div>
      <p
        className="text-[10px] font-mono tracking-wider"
        style={{ color: "rgba(255,105,180,0.3)" }}
      >
        add achievement
      </p>
    </motion.div>
  );
}

function AchievementFormModal({ existing, onClose, onSave }) {
  const isEdit = !!existing;
  const [title, setTitle] = useState(existing?.title || "");
  const [date, setDate] = useState(existing?.date || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [photos, setPhotos] = useState(existing?.photos || []);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const batch = files.slice(0, remaining);
    const newPhotos = [...photos];
    for (const file of batch) {
      const raw = await readFile(file);
      const compressed = await compress(raw);
      newPhotos.push(compressed);
    }
    setPhotos(newPhotos);
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 50));
    onSave({
      title: title.trim(),
      date: date || new Date().toISOString().split("T")[0],
      description: description.trim(),
      photos,
    });
    setSaving(false);
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
        className="relative w-full max-w-md rounded-2xl border border-white/10 overflow-hidden"
        style={{
          backgroundColor: "rgba(18,18,24,0.96)",
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="m-0 font-display uppercase text-lg tracking-wider" style={{ color: "var(--text-primary)" }}>
              {isEdit ? "edit achievement" : "new achievement"}
              <span className="text-pink-300"> {"\uD83C\uDFC6"}</span>
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              {"\u2715"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Title *
              </p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dean\u2019s List"
                className="w-full rounded-xl p-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                autoFocus
              />
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Date
              </p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl p-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  colorScheme: "dark",
                }}
              />
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Photos ({photos.length}/{MAX_PHOTOS})
              </p>
              <div className="flex flex-wrap gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative group/photo">
                    <img
                      src={url}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg border border-white/5"
                    />
                    <button
                      onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white/70 text-[10px] opacity-0 group-hover/photo:opacity-100 transition-opacity"
                    >
                      {"\u2715"}
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <label
                    className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/[0.02]"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}
                  >
                    <span style={{ color: "var(--text-secondary)", fontSize: 20 }}>+</span>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFiles}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Notes
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="what made this achievement special?"
                rows={3}
                className="w-full rounded-xl p-3 text-sm outline-none resize-none transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!title.trim() || saving}
              className="w-full py-3 rounded-xl font-display uppercase tracking-wider text-sm transition-all disabled:opacity-30"
              style={{
                background: "linear-gradient(135deg, #ff3af2, #ff6b35)",
                color: "#fff",
              }}
            >
              {saving ? "saving..." : isEdit ? "update achievement" : "save achievement"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ViewAchievementModal({ achievement, onClose, onEdit, onDelete }) {
  const photos = achievement.photos || [];
  const [photoIndex, setPhotoIndex] = useState(0);

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
        initial={{ scale: 0.85, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "rgba(18,18,24,0.96)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors z-10"
            style={{ color: "var(--text-secondary)" }}
          >
            {"\u2715"}
          </button>

          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,105,180,0.1))",
                border: "1px solid rgba(255,215,0,0.2)",
              }}
            >
              {"\uD83C\uDFC6"}
            </div>
          </div>

          <h2
            className="font-display text-xl font-bold text-center mb-1"
            style={{
              background: "linear-gradient(135deg, #ffb6c1, #ff69b4, #ffd700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {achievement.title}
          </h2>

          <p className="text-center text-xs font-mono mb-4" style={{ color: "rgba(255,105,180,0.4)" }}>
            {fmt(achievement.date)}
          </p>

          {photos.length > 0 && (
            <div className="mb-4">
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={photos[photoIndex]}
                  alt=""
                  className="w-full object-contain rounded-xl"
                  style={{ maxHeight: 250, backgroundColor: "rgba(0,0,0,0.2)" }}
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white/70 text-sm hover:bg-black/60 transition-colors"
                    >
                      {"\u25C0"}
                    </button>
                    <button
                      onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white/70 text-sm hover:bg-black/60 transition-colors"
                    >
                      {"\u25B6"}
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {photos.map((_, i) => (
                        <div
                          key={i}
                          className="rounded-full transition-all"
                          style={{
                            backgroundColor: i === photoIndex ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                            width: i === photoIndex ? 12 : 6,
                            height: 6,
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <p className="text-[10px] font-mono text-center mt-1.5" style={{ color: "rgba(255,105,180,0.3)" }}>
                {photoIndex + 1} / {photos.length}
              </p>
            </div>
          )}

          {achievement.description && (
            <p className="text-sm leading-relaxed text-center mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
              {achievement.description}
            </p>
          )}

          <div className="flex justify-center gap-3 mt-2">
            <button
              onClick={() => onEdit(achievement)}
              className="text-[11px] font-mono uppercase tracking-wider px-4 py-2 rounded-full border transition-all"
              style={{
                borderColor: "rgba(255,105,180,0.2)",
                color: "rgba(255,105,180,0.6)",
              }}
            >
              {"\u270E"} edit
            </button>
            <button
              onClick={() => { if (confirm("delete this achievement?")) onDelete(achievement.id); }}
              className="text-[11px] font-mono uppercase tracking-wider px-4 py-2 rounded-full border transition-all"
              style={{
                borderColor: "rgba(255,80,80,0.2)",
                color: "rgba(255,80,80,0.5)",
              }}
            >
              {"\uD83D\uDDD1"} delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AmnieAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [formTarget, setFormTarget] = useState(undefined);
  const [viewTarget, setViewTarget] = useState(null);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    setAchievements(load());
    setMounted(true);
  }, []);

  const updateScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(updateScroll, 120);
    return () => clearTimeout(timer);
  }, [mounted, achievements, updateScroll]);

  useEffect(() => {
    if (!mounted) return;
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScroll);
    window.addEventListener("resize", updateScroll);
    return () => {
      el.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [mounted, updateScroll]);

  const scrollBy = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 226, behavior: "smooth" });
    setTimeout(updateScroll, 350);
  }, [updateScroll]);

  const handleSave = useCallback((data) => {
    if (formTarget) {
      const updated = achievements.map((a) =>
        a.id === formTarget.id ? { ...data, id: a.id } : a
      );
      setAchievements(updated);
      save(updated);
    } else {
      const newItem = {
        ...data,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      };
      const updated = [newItem, ...achievements];
      setAchievements(updated);
      save(updated);
    }
    setFormTarget(undefined);
    setViewTarget(null);
  }, [achievements, formTarget]);

  const handleDelete = useCallback((id) => {
    const updated = achievements.filter((a) => a.id !== id);
    setAchievements(updated);
    save(updated);
    setViewTarget(null);
  }, [achievements]);

  if (!mounted) return null;

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-pink-300/50 text-xs font-display uppercase tracking-[0.3em] mb-3">
            amnie
          </p>
          <h2 className="font-display uppercase text-[clamp(1.8rem,6vw,2.8rem)] leading-[.9] tracking-tight mb-3">
            <span className="bg-gradient-to-r from-pink-300 via-pink-200 to-pink-400 bg-clip-text text-transparent">
              achievements
            </span>
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            every trophy tells a story of how far you&apos;ve come.
          </p>
        </motion.div>

        {achievements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <div
              className="inline-block rounded-2xl p-8 mb-4"
              style={{
                backgroundColor: "rgba(255,105,180,0.03)",
                border: "2px dashed rgba(255,105,180,0.1)",
              }}
            >
              <p className="text-4xl mb-3">{"\uD83C\uDFC6"}</p>
              <p className="font-display text-lg tracking-wider" style={{ color: "var(--text-primary)" }}>
                no achievements yet
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                tap + to add your first achievement
              </p>
              <button
                onClick={() => setFormTarget(null)}
                className="mt-4 px-5 py-2 rounded-full text-xs font-display uppercase tracking-wider"
                style={{
                  background: "linear-gradient(135deg, rgba(255,105,180,0.1), rgba(255,215,0,0.08))",
                  border: "1px solid rgba(255,105,180,0.15)",
                  color: "rgba(255,182,193,0.8)",
                }}
              >
                + add achievement
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="relative px-6">
            {canScrollLeft && (
              <button
                onClick={() => scrollBy(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: "rgba(18,18,24,0.9)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-secondary)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {"\u25C0"}
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scrollBy(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: "rgba(18,18,24,0.9)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-secondary)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {"\u25B6"}
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {achievements.map((a) => (
                <AchievementCard
                  key={a.id}
                  achievement={a}
                  onClick={setViewTarget}
                />
              ))}
              <AddCard onClick={() => setFormTarget(null)} />
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {formTarget !== undefined && (
          <AchievementFormModal
            key={formTarget ? formTarget.id : "add"}
            existing={formTarget || null}
            onClose={() => setFormTarget(undefined)}
            onSave={handleSave}
          />
        )}
        {viewTarget && (
          <ViewAchievementModal
            key={viewTarget.id}
            achievement={viewTarget}
            onClose={() => setViewTarget(null)}
            onEdit={(a) => { setViewTarget(null); setFormTarget(a); }}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
