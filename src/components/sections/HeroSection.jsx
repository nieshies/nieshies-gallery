"use client";
import { useEffect, useRef, useState } from "react";

export default function HeroSection({ photos }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    if (photos.length < 2) return;
    timer.current = setInterval(() => setIdx((i) => (i + 1) % photos.length), 4000);
    return () => clearInterval(timer.current);
  }, [photos.length]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const titleEl = el.querySelector(".hero-title");
    const headerEl = document.querySelector(".hero-header-bar");

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const sectionStart = rect.top + window.scrollY;
          const scrollDelta = window.scrollY - sectionStart;
          const vs = window.innerHeight;
          const progress = Math.min(1, Math.max(0, scrollDelta / vs));

          const scale = Math.max(0.5, Math.min(1, 1 - (Math.min(progress, 0.3) / 0.3) * 0.5));
          const yOffset = Math.max(-120, Math.min(0, -(Math.min(progress, 0.3) / 0.3) * 120));
          const op = Math.max(0, Math.min(1, 1 - (Math.min(progress, 0.4) / 0.4)));
          const hOp = Math.max(0, Math.min(1, (Math.min(progress, 0.3) - 0.15) / 0.15));

          el.style.opacity = op;
          if (titleEl) titleEl.style.transform = `scale(${scale}) translateY(${yOffset}px)`;
          if (headerEl) headerEl.style.opacity = isNaN(hOp) ? 0 : hOp;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (photos.length === 0) return null;

  return (
    <>
      <section ref={ref} className="relative h-svh w-full overflow-hidden hero-section">
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
        <div className="absolute bottom-16 left-8 md:left-16 origin-bottom-left hero-title">
          <h1
            className="font-display uppercase text-[clamp(3rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] text-white"
            style={{ textShadow: "0 0 26px rgba(255,145,76,0.26)" }}
          >
            nieshies dump
          </h1>
        </div>
      </section>

      <div className="hero-header-bar fixed top-0 left-0 right-0 z-40 h-14 backdrop-blur-md bg-black/60 border-b border-white/10 flex items-center justify-between px-6 lg:pl-24">
        <span className="font-display uppercase text-base tracking-[-0.03em] text-white">nieshies dump</span>
      </div>
    </>
  );
}
