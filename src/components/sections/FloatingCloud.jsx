"use client";
import useInView from "@/lib/useInView";
import TiltCard from "@/components/features/TiltCard";

const POSITIONS = [
  { x: 5, y: 0, r: -6 },
  { x: 55, y: 5, r: 4 },
  { x: 30, y: 25, r: -3 },
  { x: 70, y: 35, r: 7 },
  { x: 10, y: 50, r: -8 },
  { x: 50, y: 55, r: 5 },
  { x: 80, y: 15, r: -4 },
  { x: 25, y: 70, r: 6 },
];

export default function FloatingCloud({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  if (photos.length === 0) return null;

  return (
    <section ref={ref} className="relative py-8">
      <div className="relative h-[70vh] max-w-3xl mx-auto">
        {photos.slice(0, 8).map((photo, i) => {
          const pos = POSITIONS[i % POSITIONS.length];
          return (
            <div
              key={photo.id}
              className={`absolute reveal reveal-delay-${i}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                rotate: `${pos.r}deg`,
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0) scale(1)" : "translateY(20px) scale(0.85)",
                transition: `opacity 0.5s ${i * 0.1}s ease, transform 0.5s ${i * 0.1}s ease`,
              }}
            >
              <TiltCard
                className="w-36 md:w-44 rounded-xl overflow-hidden cursor-pointer shadow-lg"
                onClick={() => onPhotoClick?.(photo)}
              >
                <div className="aspect-[3/4]">
                  <img src={`${photo.url}?t=${photo.uploadedAt}`} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 30%" }} loading="lazy" draggable={false} />
                </div>
              </TiltCard>
            </div>
          );
        })}
      </div>
    </section>
  );
}
