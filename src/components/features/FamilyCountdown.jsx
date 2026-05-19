"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const birthdays = [
  { name: "mantip", month: 11, day: 23 },
  { name: "dr is", month: 12, day: 22 },
  { name: "sabriena", month: 4, day: 1 },
  { name: "nishi", month: 5, day: 4 },
  { name: "wanman", month: 6, day: 25 },
  { name: "ain qissy", month: 5, day: 30 },
];

function getNextBirthday() {
  const now = new Date();
  const currentYear = now.getFullYear();

  let next = null;
  let minDiff = Infinity;

  for (const b of birthdays) {
    const bdThisYear = new Date(currentYear, b.month - 1, b.day);
    const bdNextYear = new Date(currentYear + 1, b.month - 1, b.day);
    const diffThis = bdThisYear.getTime() - now.getTime();
    const diffNext = bdNextYear.getTime() - now.getTime();

    let diff;
    let targetDate;
    if (diffThis >= 0) {
      diff = diffThis;
      targetDate = bdThisYear;
    } else {
      diff = diffNext;
      targetDate = bdNextYear;
    }

    if (diff < minDiff) {
      minDiff = diff;
      next = { ...b, targetDate };
    }
  }

  return next;
}

function calcDaysUntil(targetDate) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function FamilyCountdown() {
  const [nextBirthday, setNextBirthday] = useState(null);
  const [days, setDays] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const nb = getNextBirthday();
    setNextBirthday(nb);
    setDays(calcDaysUntil(nb.targetDate));
    setMounted(true);
    const id = setInterval(() => setDays(calcDaysUntil(nb.targetDate)), 1000);
    return () => clearInterval(id);
  }, []);

  if (!nextBirthday || !mounted) return null;

  const digits = String(days).split("");

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
          className="text-xs font-display uppercase tracking-[0.3em] mb-6 text-accent/40"
        >
          next family birthday
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
              className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl flex items-center justify-center glass-panel shadow-glass"
            >
              <span
                className="font-display text-4xl sm:text-5xl font-black leading-none text-accent"
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
          className="text-sm font-display tracking-wider mt-4 text-accent/60"
        >
          days until {nextBirthday.name}&rsquo;s birthday &nbsp;🎂
        </motion.p>
      </motion.div>

      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
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
                color: "#f48c36",
                fontSize: `${12 + Math.random() * 20}px`,
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
