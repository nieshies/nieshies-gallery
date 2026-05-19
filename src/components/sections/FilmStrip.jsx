"use client";
import { useEffect, useRef, useState } from "react";

export default function FilmStrip({ photos }) {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const animRef = useRef(null);

  const doubled = [...photos, ...photos];

  useEffect(() => {
    if (paused || photos.length === 0) { cancelAnimationFrame(animRef.current); return; }
    const step = () => {
      if (!trackRef.current) return;
      const halfW = trackRef.current.scrollWidth / 2;
      if (halfW <= 0) return;
      posRef.current -= 0.6;
      if (Math.abs(posRef.current) >= halfW) posRef.current += halfW;
      trackRef.current.style.transform = `translate3d(${posRef.current}px,0,0)`;
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [paused, photos.length]);

  if (photos.length === 0) return null;

  return (
    <section className="content-section relative py-16 overflow-hidden">
      <p className="text-white/20 text-[10px] font-display uppercase tracking-[0.3em] text-center mb-6">film strip</p>
      <div className="relative cursor-pointer select-none" onClick={() => setPaused((p) => !p)}>
        <div className="absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
        <div ref={trackRef} className="flex gap-6" style={{ willChange: "transform" }}>
          {doubled.map((photo, i) => (
            <div
              key={`${photo.id}-${i}`}
              className="relative flex-shrink-0 overflow-hidden rounded-xl"
              style={{ width: "68vw", height: "42vh" }}
            >
              <img
                src={`${photo.url}?t=${photo.uploadedAt}`}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          ))}
        </div>
        {paused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] z-10">
            <p className="text-white/50 text-xs font-display uppercase tracking-[0.25em]">paused &middot; tap again to play</p>
          </div>
        )}
      </div>
    </section>
  );
}
