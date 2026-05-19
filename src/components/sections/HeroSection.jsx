"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroSection({ photos }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const titleScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.5]);
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0.15, 0.3], [0, 1]);

  useEffect(() => {
    if (photos.length < 2) return;
    timer.current = setInterval(() => setIdx((i) => (i + 1) % photos.length), 4000);
    return () => clearInterval(timer.current);
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <>
      <motion.section
        ref={ref}
        style={{ opacity: heroOpacity }}
        className="relative h-svh w-full overflow-hidden"
      >
        {photos.map((p, i) => (
          <img
            key={p.id}
            src={p.url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: i === idx ? 1 : 0, transition: "opacity 1s" }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
        <motion.div
          style={{ scale: titleScale, y: titleY }}
          className="absolute bottom-16 left-8 md:left-16 origin-bottom-left"
        >
          <h1
            className="font-display uppercase text-[clamp(3rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] text-white"
            style={{ textShadow: "0 0 26px rgba(255,145,76,0.26)" }}
          >
            nieshies dump
          </h1>
        </motion.div>
      </motion.section>

      <motion.div
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-40 h-14 backdrop-blur-md bg-black/60 border-b border-white/10 flex items-center justify-between px-6 lg:pl-24"
      >
        <span className="font-display uppercase text-base tracking-[-0.03em] text-white">nieshies dump</span>
      </motion.div>
    </>
  );
}
