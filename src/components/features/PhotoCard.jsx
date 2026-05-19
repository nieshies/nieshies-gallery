"use client";
import { useRef, useCallback } from "react";

export default function PhotoCard({ photo, onClick, aspect = "4/5", style }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--mx", `${mx}%`);
    ref.current.style.setProperty("--my", `${my}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty("--mx", "50%");
    ref.current.style.setProperty("--my", "50%");
  }, []);

  return (
    <article
      ref={ref}
      data-photo-card="true"
      tabIndex={0}
      onClick={() => onClick?.(photo)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-2xl border border-white/15 bg-[var(--glass)] shadow-glass backdrop-blur-md cursor-pointer"
      style={{
        aspectRatio: aspect,
        transformStyle: "preserve-3d",
        "--mx": "50%",
        "--my": "50%",
        ...style,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle at var(--mx) var(--my), rgba(255,170,120,0.28), transparent 50%)" }}
      />
      <div className="relative h-full min-h-[220px] w-full overflow-hidden">
        <img
          src={`${photo.url}?t=${photo.uploadedAt}`}
          alt=""
          loading="lazy"
          className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-110"
          style={{ position: "absolute", height: "100%", width: "100%", inset: 0 }}
          draggable={false}
        />
      </div>
      {photo.caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-3">
          <p className="text-xs tracking-wide text-white/85 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {photo.caption}
          </p>
        </div>
      )}
    </article>
  );
}
