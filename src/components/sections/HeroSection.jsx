"use client";
import { useEffect, useRef, useState } from "react";
import { getPhotoUrl } from "@/utils/photo";

export default function HeroSection({ photos, title = "nishi's dump" }) {
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
          el.style.opacity = op;
          if (titleEl) titleEl.style.transform = `scale(${scale}) translateY(${yOffset}px)`;
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
            src={getPhotoUrl(p.url, "full")}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: i === idx ? 1 : 0, transition: "opacity 1s" }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
        <div className="absolute inset-0 flex items-center justify-center hero-title">
          <h1
            className="font-display uppercase text-[clamp(2.4rem,5vw,4rem)] leading-[0.92] tracking-[-0.03em] text-white text-center"
            style={{ textShadow: "0 0 26px rgba(255,145,76,0.26)" }}
          >
            {title}
          </h1>
        </div>
      </section>
    </>
  );
}
