"use client";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

export default function StackStory({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  if (photos.length === 0) return null;

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-xs px-6 space-y-6">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(40px)",
              transition: `opacity 0.5s ${i * 0.08}s ease, transform 0.5s ${i * 0.08}s ease`,
            }}
          >
            <PhotoCard photo={photo} onClick={onPhotoClick} aspect="4/5" />
          </div>
        ))}
      </div>
    </section>
  );
}
