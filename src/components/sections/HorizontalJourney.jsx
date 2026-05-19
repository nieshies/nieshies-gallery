"use client";
import { useRef, useEffect } from "react";

export default function HorizontalJourney({ photos, onPhotoClick }) {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || photos.length === 0) return;

    let lastTime = performance.now();
    const update = (now) => {
      const rect = section.getBoundingClientRect();
      const winW = window.innerWidth;
      const trackW = track.scrollWidth;
      const scrollable = Math.max(0, trackW - winW);
      const sectionH = Math.max(1, section.offsetHeight - window.innerHeight);
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / sectionH));
      const delta = now - lastTime;
      lastTime = now;

      if (!pausedRef.current && rect.bottom > 0 && rect.top < window.innerHeight) {
        progressRef.current = (progressRef.current + delta * 0.000035) % 1;
      }

      const combinedProgress = Math.min(1, scrollProgress * 0.72 + progressRef.current * 0.28);
      track.style.transform = `translate3d(${-combinedProgress * scrollable}px, 0, 0)`;
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${Math.max(140, photos.length * 26)}vh` }}>
      <div className="sticky top-0 h-svh overflow-hidden flex items-center">
        <div
          ref={trackRef}
          className="flex gap-6 px-6"
          style={{ willChange: "transform" }}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
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
