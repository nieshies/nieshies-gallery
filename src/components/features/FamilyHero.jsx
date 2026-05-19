"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const WARM = ["#f48c36", "#ffb347", "#ffd700", "#e67e22", "#f39c12"];

export default function FamilyHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="relative pt-28 pb-8 px-4 overflow-hidden">
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs font-display uppercase tracking-[0.3em] mb-4 text-accent/50"
        >
          roots that hold us together
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 120 }}
          className="font-display text-[clamp(3rem,12vw,6rem)] leading-[.9] tracking-tight mb-3"
        >
          <span
            className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent"
            style={{ textShadow: "0 0 40px rgba(244,140,54,0.15)" }}
          >
            family
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm max-w-md mx-auto text-accent/35"
        >
          mantip &bull; dr is &bull; sabriena &bull; nishi &bull; wanman &bull; ain qissy
        </motion.p>
      </div>

      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute text-sm"
              initial={{ opacity: 0, x: Math.random() * 100, y: "110%" }}
              animate={{
                opacity: [0, 0.4, 0.15, 0.4, 0],
                y: "-10%",
                x: `${30 + Math.random() * 40}%`,
              }}
              transition={{
                duration: 7 + Math.random() * 6,
                repeat: Infinity,
                delay: i * 1.4 + Math.random() * 2,
                ease: "linear",
              }}
              style={{
                left: `${5 + Math.random() * 90}%`,
                color: WARM[i % WARM.length],
                fontSize: `${10 + Math.random() * 14}px`,
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
