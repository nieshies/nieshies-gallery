"use client";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

const POSITIONS = [
  { x: 5, y: 0, r: -6 }, { x: 55, y: 5, r: 4 },
  { x: 30, y: 25, r: -3 }, { x: 70, y: 35, r: 7 },
  { x: 10, y: 50, r: -8 }, { x: 50, y: 55, r: 5 },
  { x: 80, y: 15, r: -4 }, { x: 25, y: 70, r: 6 },
];

export default function FloatingCloud({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  if (photos.length === 0) return null;

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="relative mx-auto h-[120vh] w-full max-w-6xl">
        {photos.slice(0, 8).map((photo, i) => {
          const pos = POSITIONS[i % POSITIONS.length];
          return (
            <div
              key={photo.id}
              className="absolute"
              style={{
                top: `${pos.y}%`,
                left: `${pos.x}%`,
                width: "min(18rem, 42vw)",
                rotate: `${pos.r}deg`,
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(36px)",
                transition: `opacity 0.5s ${i * 0.1}s ease, transform 0.5s ${i * 0.1}s ease`,
              }}
            >
              <PhotoCard photo={photo} onClick={onPhotoClick} aspect="4/5" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
