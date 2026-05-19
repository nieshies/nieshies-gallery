"use client";
import { useRef, useEffect } from "react";
import TiltCard from "@/components/features/TiltCard";

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
          const progress = Math.min(1, Math.max(0, delta / window.innerHeight));

          layersRef.current.forEach((layer, i) => {
            if (!layer) return;
            const speed = [20, 0, -20][i];
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
    <section ref={ref} className="relative py-8 overflow-hidden">
      <div className="space-y-3">
        {layers.map((layerPhotos, li) => (
          <div key={li} ref={(el) => (layersRef.current[li] = el)} className="flex gap-3 px-4">
            {layerPhotos.map((photo) => (
              <TiltCard
                key={photo.id}
                className="w-44 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer"
                data-photo-id={photo.id}
                onClick={() => onPhotoClick?.(photo)}
              >
                <div className="aspect-[3/4]">
                  <img src={`${photo.url}?t=${photo.uploadedAt}`} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 30%" }} loading="lazy" draggable={false} />
                </div>
              </TiltCard>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
