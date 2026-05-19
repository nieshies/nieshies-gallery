"use client";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

export default function MemoryWall({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.05 });

  if (photos.length === 0) return null;

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.slice(0, 12).map((photo, i) => (
            <div
              key={photo.id}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.5s ${i * 0.04}s ease, transform 0.5s ${i * 0.04}s ease`,
              }}
            >
              <PhotoCard
                photo={photo}
                onClick={onPhotoClick}
                aspect="4/5"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
