"use client";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

export default function HorizontalJourney({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.05 });
  if (photos.length === 0) return null;

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 md:px-10 space-y-6">
        <div className="flex flex-wrap gap-4 justify-center">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              style={{
                width: "min(32rem, 90vw)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(40px)",
                transition: `opacity 0.5s ${i * 0.06}s ease, transform 0.5s ${i * 0.06}s ease`,
              }}
            >
              <PhotoCard photo={photo} onClick={onPhotoClick} aspect="4/3" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
