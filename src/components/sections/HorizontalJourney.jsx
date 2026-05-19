"use client";
import { useRef, useEffect } from "react";

export default function HorizontalJourney({ photos, onPhotoClick }) {
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const posRef = useRef(0);

  useEffect(() => {
    if (photos.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let id;
    const step = () => {
      if (!pausedRef.current) {
        posRef.current -= 0.6;
        const half = trackRef.current.scrollWidth / 2;
        if (Math.abs(posRef.current) >= half) posRef.current = 0;
        trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
      }
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [photos.length]);

  if (photos.length === 0) return null;
  const loopPhotos = [...photos, ...photos];

  return (
    <section className="relative overflow-hidden py-20">
      <div className="flex min-h-[80vh] items-center overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-6 px-6 horizontal-loop-track"
          style={{ willChange: "transform" }}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {loopPhotos.map((photo, index) => (
            <div
              key={`${photo.id}-${index}`}
              className="shrink-0 cursor-pointer"
              style={{ width: "min(36rem, 84vw)" }}
              onClick={() => onPhotoClick?.(photo)}
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[var(--glass)] shadow-glass backdrop-blur-md" style={{ aspectRatio: "4/3" }}>
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={`${photo.url}?t=${photo.uploadedAt}`}
                    alt=""
                    loading="lazy"
                    className="object-cover"
                    style={{ position: "absolute", height: "100%", width: "100%", inset: 0 }}
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
