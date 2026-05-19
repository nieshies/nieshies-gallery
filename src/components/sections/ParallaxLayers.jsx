"use client";
import { useRef, useEffect } from "react";
import PhotoCard from "@/components/features/PhotoCard";

export default function ParallaxLayers({ photos, onPhotoClick }) {
  if (photos.length === 0) return null;
  const ref = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const start = rect.top + window.scrollY;
          const delta = window.scrollY - start;
          const vs = window.innerHeight;
          const progress = Math.min(1, Math.max(0, delta / vs));
          layersRef.current.forEach((layer, i) => {
            if (!layer) return;
            const speed = [18, 0, -18][i];
            layer.style.transform = `translateY(${progress * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const n = Math.ceil(photos.length / 3);
  const layers = [photos.slice(0, n), photos.slice(n, n * 2), photos.slice(n * 2)];

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 md:px-10 space-y-6">
        {layers.map((layerPhotos, li) => (
          <div key={li} ref={(el) => (layersRef.current[li] = el)} className="flex gap-4" style={{ willChange: "transform" }}>
            {layerPhotos.map((photo) => (
              <div key={photo.id} className="w-48 flex-shrink-0">
                <PhotoCard photo={photo} onClick={onPhotoClick} aspect="4/5" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
