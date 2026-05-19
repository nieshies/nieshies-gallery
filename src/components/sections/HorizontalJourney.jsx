"use client";
import { useRef, useEffect } from "react";

export default function HorizontalJourney({ photos, onPhotoClick }) {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || photos.length === 0) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = section.getBoundingClientRect();
          const winW = window.innerWidth;
          const trackW = track.scrollWidth;
          const scrollable = Math.max(0, trackW - winW);
          const sectionH = section.offsetHeight - window.innerHeight;
          const scrolled = Math.max(0, Math.min(1, -rect.top / sectionH));
          track.style.transform = `translateX(${-scrolled * scrollable}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${Math.max(120, photos.length * 24)}vh` }}>
      <div className="sticky top-0 h-svh overflow-hidden flex items-center">
        <div
          ref={trackRef}
          className="flex gap-6 px-6"
          style={{ willChange: "transform" }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="shrink-0 cursor-pointer"
              style={{ width: "min(32rem, 80vw)" }}
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
