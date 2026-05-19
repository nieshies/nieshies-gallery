"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

const STORAGE_KEY = "nieshies-family-photos";

const family = [
  { nick: "mantip", relation: "dad", age: null, desc: "banker · lots of money · always says yes · og runner", emoji: "🏃" },
  { nick: "dr is", relation: "mom", age: null, desc: "the goat · also has money · powerhouse", emoji: "🐐" },
  { nick: "sabriena", relation: "older sister", age: 24, desc: "lives for BTS · ARMY through and through", emoji: "🎧" },
  { nick: "nishi", relation: "me", age: 22, desc: "clingy · whipped for amnie", emoji: "🫠" },
  { nick: "wanman", relation: "brother", age: 20, desc: "funniest in the family · black sheep energy", emoji: "😆" },
  { nick: "ain qissy", relation: "younger sister", age: 18, desc: "annoying but we love her · face like chinese", emoji: "🇨🇳" },
];

function loadPhotos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function savePhotos(photos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch {}
}

function PolaroidCard({ member, index }) {
  const [flipped, setFlipped] = useState(false);
  const [photos, setPhotos] = useState(() => loadPhotos());
  const fileRef = useRef(null);
  const photoUrl = photos[member.nick];

  useEffect(() => {
    const onStorage = () => setPhotos(loadPhotos());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handlePhotoClick = useCallback((e) => {
    e.stopPropagation();
    fileRef.current?.click();
  }, []);

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = r.result;
      setPhotos((prev) => {
        const next = { ...prev, [member.nick]: dataUrl };
        savePhotos(next);
        return next;
      });
    };
    r.readAsDataURL(file);
  }, [member.nick]);

  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    setPhotos((prev) => {
      const next = { ...prev };
      delete next[member.nick];
      savePhotos(next);
      return next;
    });
  }, [member.nick]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 150, damping: 16 }}
      className="perspective-[1000px] cursor-pointer"
      onClick={() => !flipped && setFlipped(true)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full"
        style={{ transformStyle: "preserve-3d", minHeight: 260 }}
      >
        <div
          className="absolute inset-0 rounded-2xl p-4 flex flex-col items-center backface-hidden"
          style={{
            backgroundColor: "rgba(255,185,80,0.04)",
            border: "1px solid rgba(255,185,80,0.12)",
            backfaceVisibility: "hidden",
          }}
        >
          <div
            onClick={handlePhotoClick}
            className="relative w-full overflow-hidden mb-3 cursor-pointer transition-all duration-200 hover:opacity-85"
            style={{
              background: "#fff",
              padding: photoUrl ? "6px 6px 28px 6px" : "12px",
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            {photoUrl ? (
              <div className="relative">
                <img
                  src={photoUrl}
                  alt=""
                  className="w-full object-cover rounded-sm"
                  style={{ aspectRatio: "4/3" }}
                />
                <div className="text-center mt-1.5">
                  <span className="text-[10px] font-[family-name:var(--font-sans)]" style={{ color: "#999", fontStyle: "italic" }}>
                    {member.nick}
                  </span>
                </div>
                <button
                  onClick={handleRemove}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-white/70 text-[10px] hover:bg-black/60 transition-colors"
                >
                  &#10005;
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center" style={{ minHeight: 120 }}>
                <span className="text-2xl mb-1">📷</span>
                <span className="text-[10px] font-mono" style={{ color: "#bbb" }}>tap to add photo</span>
              </div>
            )}
          </div>

          <h3
            className="font-display text-lg tracking-wider text-center"
            style={{
              background: "linear-gradient(135deg, #ffb950, #ffd700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {member.nick}
          </h3>
          <p className="text-[11px] font-mono mt-0.5 text-center" style={{ color: "rgba(255,185,80,0.4)" }}>
            &mdash; {member.relation}
          </p>
          {member.age && (
            <p className="text-[10px] font-mono mt-0.5 text-center" style={{ color: "rgba(255,185,80,0.25)" }}>
              age {member.age}
            </p>
          )}
          <p className="text-[9px] font-mono mt-2 text-center" style={{ color: "rgba(255,185,80,0.2)" }}>
            tap photo to change &middot; tap card for fun fact
          </p>

          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>

        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col items-center justify-center text-center backface-hidden"
          style={{
            backgroundColor: "rgba(255,185,80,0.06)",
            border: "1px solid rgba(255,185,80,0.15)",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          onClick={() => setFlipped(false)}
        >
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            {member.desc}
          </p>
          <p className="text-[10px] font-mono mt-3" style={{ color: "rgba(255,185,80,0.3)" }}>
            tap to flip back
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FamilyMembers() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {family.map((member, i) => (
            <PolaroidCard key={member.nick} member={member} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
