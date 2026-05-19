"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0d0d1a]"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-20 h-20 mb-8"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="mobius-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7b2fff" />
                  <stop offset="50%" stopColor="#ff3af2" />
                  <stop offset="100%" stopColor="#00f5d4" />
                </linearGradient>
              </defs>
              <motion.path
                d="M50 10 C70 10 85 25 85 45 C85 65 70 80 50 80 C30 80 15 65 15 45 C15 25 30 10 50 10Z"
                fill="none"
                stroke="url(#mobius-grad)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.path
                d="M50 20 C60 20 70 30 70 45 C70 60 60 70 50 70 C40 70 30 60 30 45 C30 30 40 20 50 20Z"
                fill="none"
                stroke="url(#mobius-grad)"
                strokeWidth="1.5"
                opacity="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
              />
              <motion.circle
                cx="50" cy="10"
                r="2"
                fill="#ff3af2"
                animate={{
                  cx: [50, 85, 50, 15, 50],
                  cy: [10, 45, 80, 45, 10],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/40 text-xs font-mono tracking-[0.3em] uppercase"
          >
            LOADING CONTENT
          </motion.p>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="h-[1px] mt-4 bg-gradient-to-r from-a1 via-a5 to-a2"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
