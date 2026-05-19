"use client";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

export default function MemoryWall({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.05 });

  if (photos.length === 0) return null;

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.5s ${i * 0.03}s ease, transform 0.5s ${i * 0.03}s ease`,
              }}
            >
              <PhotoCard
                photo={photo}
                onClick={onPhotoClick}
                aspect="4/5"
                tilt={true}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
