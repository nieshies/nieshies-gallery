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
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-white/40 text-xs font-display uppercase tracking-[0.3em] mb-2"
        >
          nieshies gallery
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-display uppercase text-[clamp(2.5rem,10vw,6rem)] leading-[.88] tracking-tight text-white"
        >
          random
          <br />
          memories
        </motion.h1>
      </div>
      {photos.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === idx ? "bg-white/70 w-6" : "bg-white/30"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
