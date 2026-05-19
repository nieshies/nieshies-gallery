"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import usePaginatedMemories from "@/hooks/usePaginatedMemories";
import useAmnieAchievements from "@/hooks/useAmnieAchievements";
import CinematicPhotoModal from "@/components/features/CinematicPhotoModal";
import DayCounter from "@/components/features/DayCounter";

function formatPrettyDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" });
}

const ROTATIONS = [-3, 2, -1, 4, -2, 1, -4, 3, -1, 2, -3, 0];
const MARGIN_LEFT = [0, -32, -28, 24, -24, -36, 28, -30, -26, 22, -34, -22];
const MARGIN_TOP = [0, 16, -6, 22, 8, 18, -2, 28, 4, 30, 12, 36];

function AddMemoryModal({ onClose, onAdd }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleFile = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!files.length) return;
    setUploading(true);
    let done = 0;
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("photo", file);
        if (description.trim()) formData.append("description", description.trim());
        const res = await fetch("/api/amnie", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          onAdd(data.memory);
          done++;
        }
      } catch {}
    }
    if (done) onClose();
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 18, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0, scale: 0.97 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[2rem] border border-rose-200/25 bg-[linear-gradient(180deg,rgba(34,16,23,0.98),rgba(16,9,14,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-lg text-white/40 hover:text-white">&times;</button>
        <p className="mb-5 text-xs uppercase tracking-[0.3em] text-rose-200/70">new memory</p>
        <div className="space-y-4">
          <label className="block cursor-pointer rounded-[1.5rem] border border-dashed border-rose-100/20 bg-white/[0.03] p-5 text-center">
            {previews.length ? (
              <div className="flex flex-wrap gap-2 justify-center max-h-40 overflow-y-auto">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 text-white/60 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/48">Choose memories</p>
            )}
            <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Little note for these memories..."
            className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none placeholder:text-white/26"
          />
          <button
            onClick={handleSubmit}
            disabled={!files.length || uploading}
            className="w-full rounded-full bg-[linear-gradient(135deg,#fca5a5,#fb7185)] px-4 py-3 text-sm uppercase tracking-[0.22em] text-white transition disabled:opacity-40"
          >
            {uploading ? "saving..." : `add memory${files.length > 1 ? "ies" : ""}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddAchievementModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [achievementDate, setAchievementDate] = useState("");
  const [note, setNote] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (achievementDate) formData.append("achievementDate", achievementDate);
      if (note.trim()) formData.append("note", note.trim());
      if (photoFile) formData.append("photo", photoFile);
      const res = await fetch("/api/amnie/achievements", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        onAdd(data.achievement);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 18, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0, scale: 0.97 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-[2rem] border border-rose-200/25 bg-[linear-gradient(180deg,rgba(34,16,23,0.98),rgba(16,9,14,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-lg text-white/40 hover:text-white">&times;</button>
        <p className="mb-5 text-xs uppercase tracking-[0.3em] text-rose-200/70">new achievement</p>
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Achievement title"
            className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/26"
          />
          <input
            type="date"
            value={achievementDate}
            onChange={(e) => setAchievementDate(e.target.value)}
            className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="A short note about this proud moment..."
            className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none placeholder:text-white/26"
          />
          <label className="block cursor-pointer rounded-[1.5rem] border border-dashed border-rose-100/20 bg-white/[0.03] p-5 text-center">
            {photoPreview ? (
              <img src={photoPreview} alt="" className="mx-auto max-h-48 rounded-[1.25rem] object-contain" />
            ) : (
              <p className="text-sm text-white/48">Optional achievement photo</p>
            )}
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="w-full rounded-full bg-[linear-gradient(135deg,#fda4af,#f9a8d4)] px-4 py-3 text-sm uppercase tracking-[0.22em] text-white transition disabled:opacity-40"
          >
            {saving ? "saving..." : "save achievement"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AchievementSection({ achievements, onDelete, onAddClick, loading }) {
  return (
    <section className="px-6 py-16 sm:px-10 lg:pl-28 lg:pr-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-rose-300/72">future dentist</p>
            <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] uppercase leading-[0.94] text-white">
              achievements
            </h2>
          </div>
          <button
            onClick={onAddClick}
            className="rounded-full border border-rose-200/20 bg-white/[0.04] px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-rose-100 transition hover:border-rose-200/36 hover:bg-white/[0.08]"
          >
            Add achievement
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-white/38">Loading achievements...</p>
        ) : achievements.length === 0 ? (
          <div className="rounded-[2rem] border border-rose-200/12 bg-white/[0.03] px-8 py-12 text-center">
            <p className="text-lg uppercase tracking-[0.22em] text-white/56">No achievements yet</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {achievements.map((achievement, index) => (
              <motion.article
                key={achievement.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.18) }}
                className="overflow-hidden rounded-[2rem] border border-rose-200/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] shadow-[0_18px_60px_rgba(0,0,0,0.25)]"
              >
                {achievement.photoUrl ? (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={achievement.photoUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="p-6">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-rose-200/70">
                    {formatPrettyDate(achievement.achievementDate) || "milestone"}
                  </p>
                  <h3 className="font-display text-2xl leading-tight text-white">{achievement.title}</h3>
                  {achievement.note ? (
                    <p className="mt-3 text-sm leading-7 text-white/64">{achievement.note}</p>
                  ) : null}
                  <button
                    onClick={() => onDelete(achievement.id)}
                    className="mt-6 rounded-full border border-red-300/18 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-red-200 transition hover:border-red-200/36 hover:text-red-100"
                  >
                    Delete
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MemoriesSection({ memories, onView, onDelete, onAddClick, loaderRef, loading, loadingMore, hasMore }) {
  const [hovered, setHovered] = useState(null);

  if (loading && memories.length === 0) {
    return (
      <section className="px-6 pb-32 pt-12 sm:px-10 lg:pl-28 lg:pr-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-white/38">Loading memories...</p>
        </div>
      </section>
    );
  }

  if (memories.length === 0) {
    return (
      <section className="px-6 pb-32 pt-12 sm:px-10 lg:pl-28 lg:pr-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-rose-300/72">our memories</p>
              <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] uppercase leading-[0.94] text-white">memories</h2>
            </div>
            <button onClick={onAddClick}
              className="rounded-full border border-rose-200/20 bg-white/[0.04] px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-rose-100 transition hover:border-rose-200/36 hover:bg-white/[0.08]">
              Add memory
            </button>
          </div>
          <div className="rounded-[2rem] border border-rose-200/12 bg-white/[0.03] px-8 py-12 text-center">
            <p className="text-lg uppercase tracking-[0.22em] text-white/56">No memories yet</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-32 pt-12 sm:px-10 lg:pl-28 lg:pr-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-rose-300/72">our memories</p>
            <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] uppercase leading-[0.94] text-white">memories</h2>
          </div>
          <button onClick={onAddClick}
            className="rounded-full border border-rose-200/20 bg-white/[0.04] px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-rose-100 transition hover:border-rose-200/36 hover:bg-white/[0.08]">
            Add memory
          </button>
        </div>

        <div className="flex flex-wrap justify-center">
          {memories.map((memory, i) => (
            <div
              key={memory.id}
              className="shrink-0 relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                marginLeft: `${MARGIN_LEFT[i % 12]}px`,
                marginTop: `${MARGIN_TOP[i % 12]}px`,
                rotate: `${ROTATIONS[i % 12]}deg`,
                zIndex: hovered === i ? 100 : memories.length - i,
                transition: "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), z-index 0s",
              }}
            >
              <button
                type="button"
                onClick={() => onView(memory)}
                className="group relative overflow-hidden rounded-[1.8rem] border border-rose-200/12 bg-white/[0.03] shadow-[0_18px_56px_rgba(0,0,0,0.22)] block w-52 sm:w-56 lg:w-60"
                style={{
                  transform: hovered === i ? "translateY(-14px) scale(1.06)" : "scale(1)",
                  transition: "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                <div className="aspect-[4/5] overflow-hidden rounded-[1.8rem]">
                  <img src={memory.photoUrl} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />
              </button>

              {hovered === i && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(memory.id); }}
                  className="absolute -top-2 -right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs text-white/70 backdrop-blur-md transition hover:bg-red-500/80 hover:text-white"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        <div ref={loaderRef} className="mt-16 flex h-12 items-center justify-center">
          {loadingMore ? (
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/28">loading more...</span>
          ) : !hasMore && memories.length ? (
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/18">all memories loaded</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function AmnieDump() {
  const { items: memories, setItems, loading, loadingMore, hasMore, fetchNext } = usePaginatedMemories("/api/amnie");
  const { achievements, setAchievements, loading: achievementsLoading } = useAmnieAchievements();
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [viewing, setViewing] = useState(null);
  const loaderRef = useRef(null);

  useEffect(() => {
    const element = loaderRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) fetchNext();
      },
      { rootMargin: "240px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, fetchNext]);

  const addMemory = useCallback((memory) => {
    setItems((prev) => [memory, ...prev]);
  }, [setItems]);

  const addAchievement = useCallback((achievement) => {
    setAchievements((prev) => [achievement, ...prev]);
  }, [setAchievements]);

  const deleteMemory = useCallback(async (id) => {
    await fetch(`/api/amnie/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((memory) => memory.id !== id));
    setViewing(null);
  }, [setItems]);

  const deleteAchievement = useCallback(async (id) => {
    await fetch(`/api/amnie/achievements/${id}`, { method: "DELETE" });
    setAchievements((prev) => prev.filter((achievement) => achievement.id !== id));
  }, [setAchievements]);

  const heroPhoto = memories[0]?.photoUrl;

  return (
    <>
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,#4a1d2d_0%,#140a11_42%,#080608_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,228,230,0.18),transparent_64%)]" />
          <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-rose-300/10 blur-3xl" />
          <div className="absolute right-[-6rem] top-52 h-72 w-72 rounded-full bg-pink-300/10 blur-3xl" />
        </div>

        <section className="relative px-6 pb-18 pt-28 sm:px-10 lg:pl-28 lg:pr-12">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] lg:items-center">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-rose-200/70">amnie</p>
              <h1 className="font-display text-[clamp(3rem,8vw,6.2rem)] uppercase leading-[0.88] tracking-[-0.05em] text-white">
                Sweet years, proud milestones, and the future dentist glow.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/64">
                every day since 2 dec 2023
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowAddMemory(true)}
                  className="rounded-full bg-[linear-gradient(135deg,#fda4af,#fb7185)] px-6 py-3 text-xs uppercase tracking-[0.24em] text-white shadow-[0_16px_44px_rgba(251,113,133,0.28)]"
                >
                  Add memory
                </button>
                <button
                  onClick={() => setShowAddAchievement(true)}
                  className="rounded-full border border-rose-200/24 bg-white/[0.05] px-6 py-3 text-xs uppercase tracking-[0.24em] text-rose-100 transition hover:bg-white/[0.08]"
                >
                  Add achievement
                </button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -left-6 top-10 h-28 w-28 rounded-full bg-rose-200/18 blur-2xl" />
              <div className="absolute -right-2 bottom-8 h-24 w-24 rounded-full bg-pink-200/16 blur-2xl" />
              <div className="relative rotate-[3deg] overflow-hidden rounded-[2.4rem] border border-rose-200/16 bg-white/[0.04] p-3 shadow-[0_28px_90px_rgba(0,0,0,0.3)]">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.8rem] bg-black/20">
                  {heroPhoto ? (
                    <img src={heroPhoto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/30">No memory yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <AchievementSection
          achievements={achievements}
          onDelete={deleteAchievement}
          onAddClick={() => setShowAddAchievement(true)}
          loading={achievementsLoading}
        />

        <MemoriesSection
          memories={memories}
          onView={(memory) => setViewing({ raw: memory, src: memory.photoUrl, caption: memory.description || "" })}
          onDelete={deleteMemory}
          onAddClick={() => setShowAddMemory(true)}
          loaderRef={loaderRef}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
        />
      </div>

      <DayCounter variant="amnie" />

      <AnimatePresence>
        {showAddMemory ? <AddMemoryModal onClose={() => setShowAddMemory(false)} onAdd={addMemory} /> : null}
        {showAddAchievement ? <AddAchievementModal onClose={() => setShowAddAchievement(false)} onAdd={addAchievement} /> : null}
        {viewing ? (
          <CinematicPhotoModal
            item={viewing}
            onClose={() => setViewing(null)}
            onDelete={deleteMemory}
            deleteLabel="Delete memory"
            metaLine={viewing.raw.date}
            hideText={false}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
