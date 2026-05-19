"use client";
import { useRef, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";

const tags = [
  { label: "crybaby", emoji: "💧" },
  { label: "malatang", emoji: "🍜" },
  { label: "char kuey teow", emoji: "🥢" },
  { label: "mixue", emoji: "🍦" },
  { label: "eco shop", emoji: "🛍️" },
  { label: "MrDIY", emoji: "🔧" },
];

const PARTICLE_COLORS = ["#f48c36", "#ffb347", "#ffd700", "#ff6b35", "#e67e22"];

function ParticleBurst(x, y) {
  const count = 12;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const size = 8 + Math.random() * 12;
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const dist = 50 + Math.random() * 80;
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    el.innerHTML = "✦";
    el.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: ${size}px;
      color: ${color};
      pointer-events: none;
      z-index: 9999;
      transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      text-shadow: 0 0 8px ${color};
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 40}px) scale(0)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 900);
  }
}

export default function AmnieHero() {
  const heartsRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleTagClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    ParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, []);

  return (
    <section className="relative pt-28 pb-8 px-4 overflow-hidden">
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-accent/50 text-xs font-display uppercase tracking-[0.3em] mb-4"
        >
          for my love
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 120 }}
          className="font-display text-[clamp(2rem,7vw,3.5rem)] leading-[1.1] tracking-tight mb-3"
        >
          <span
            className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent"
            style={{ textShadow: "0 0 40px rgba(244,140,54,0.15)" }}
          >
            baby sayang manja ushuk
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
          style={{
            backgroundColor: "rgba(244,140,54,0.08)",
            border: "1px solid rgba(244,140,54,0.15)",
          }}
        >
          <motion.span
            animate={{ rotate: [0, 15, 0, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm"
          >
            🦷
          </motion.span>
          <span className="text-[11px] font-display uppercase tracking-widest text-accent/60">
            dental student &middot; future dr.
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-2 mt-4"
        >
          {tags.map((tag, i) => (
            <motion.button
              key={tag.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.08, type: "spring", stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleTagClick}
              className="px-3 py-1.5 rounded-full text-xs font-display tracking-wider cursor-pointer transition-all duration-200 select-none"
              style={{
                backgroundColor: "rgba(244,140,54,0.06)",
                border: "1px solid rgba(244,140,54,0.12)",
                color: "rgba(244,140,54,0.7)",
              }}
            >
              {tag.emoji} {tag.label}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {mounted && (
        <div ref={heartsRef} className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute text-sm"
              initial={{ opacity: 0, x: Math.random() * 100, y: "110%" }}
              animate={{
                opacity: [0, 0.5, 0.2, 0.5, 0],
                y: "-10%",
                x: `${30 + Math.random() * 40}%`,
              }}
              transition={{
                duration: 6 + Math.random() * 8,
                repeat: Infinity,
                delay: i * 1.2 + Math.random() * 2,
                ease: "linear",
              }}
              style={{
                left: `${5 + Math.random() * 90}%`,
                color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
                fontSize: `${10 + Math.random() * 16}px`,
                filter: `${Math.random() > 0.5 ? "blur(0.5px)" : "none"}`,
              }}
            >
              ✦
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
