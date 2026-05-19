"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function HeroSection({ photos }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (photos.length < 2) return;
    timer.current = setInterval(() => setIdx((i) => (i + 1) % photos.length), 4000);
    return () => clearInterval(timer.current);
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <section className="relative h-svh w-full overflow-hidden">
      {photos.map((p, i) => (
        <img
          key={p.id}
          src={p.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === idx ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      <div className="absolute bottom-16 left-8 md:left-16">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-display uppercase text-[clamp(3rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] text-white"
          style={{ textShadow: "0 0 26px rgba(255,145,76,0.26)" }}
        >
          nieshies dump
        </motion.h1>
      </div>
    </section>
  );
}
