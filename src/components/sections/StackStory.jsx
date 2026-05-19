"use client";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

export default function StackStory({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  if (photos.length === 0) return null;

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-md px-6 space-y-8 md:max-w-lg">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0) scale(1)" : "translateY(60px) scale(0.96)",
              transition: `opacity 0.56s ${i * 0.08}s ease, transform 0.56s ${i * 0.08}s cubic-bezier(0.23, 1, 0.32, 1)`,
            }}
          >
            <PhotoCard photo={photo} onClick={onPhotoClick} aspect="9/16" />
          </div>
        ))}
      </div>
    </section>
  );
}
