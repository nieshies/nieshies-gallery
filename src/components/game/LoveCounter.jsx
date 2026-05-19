"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const START_DATE = new Date("2023-12-02T00:00:00+08:00");

function calcDays() {
  const now = new Date();
  const diff = now.getTime() - START_DATE.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function LoveCounter() {
  const [days, setDays] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDays(calcDays());
    setMounted(true);
    const id = setInterval(() => setDays(calcDays()), 1000);
    return () => clearInterval(id);
  }, []);

  const digits = String(days).split("");

  if (!mounted) return null;

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-md mx-auto text-center relative z-10"
      >
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs font-display uppercase tracking-[0.3em] mb-6"
          style={{ color: "rgba(255,105,180,0.4)" }}
        >
          since we became us
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-2 sm:gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {digits.map((d, i) => (
            <motion.div
              key={`${mounted ? days : "0"}-${i}`}
              initial={{ opacity: 0, y: -30, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.4 + i * 0.12,
                type: "spring",
                stiffness: 200,
                damping: 12,
              }}
              className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: "rgba(255,105,180,0.06)",
                border: "1px solid rgba(255,105,180,0.2)",
                boxShadow: "0 0 20px rgba(255,105,180,0.06)",
              }}
            >
              <span
                className="font-display text-4xl sm:text-5xl font-black leading-none"
                style={{
                  background: "linear-gradient(135deg, #ffb6c1, #ff69b4, #ff1493)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {d}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm font-display tracking-wider mt-4"
          style={{ color: "rgba(255,105,180,0.6)" }}
        >
          days since we became us
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-[10px] font-mono mt-1"
          style={{ color: "rgba(255,105,180,0.25)" }}
        >
          2 . 12 . 2023 &rarr; &infin;
        </motion.p>
      </motion.div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ scale: [1, 1.008, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "center center" }}
      />

      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0, y: "100%", rotate: -10 }}
              animate={{ opacity: [0, 0.3, 0], y: "-10%", rotate: 10 }}
              transition={{
                duration: 5 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "linear",
              }}
              style={{
                left: `${10 + Math.random() * 80}%`,
                color: "#ff69b4",
                fontSize: `${12 + Math.random() * 20}px`,
              }}
            >
              ♥
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
