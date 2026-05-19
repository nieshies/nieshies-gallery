"use client";
import useInView from "@/lib/useInView";
import TiltCard from "@/components/features/TiltCard";

export default function CinematicViewer({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.1 });

  if (photos.length === 0) return null;
  const photo = photos[0];

  return (
    <section ref={ref} className="relative py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <TiltCard
            className="rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => onPhotoClick?.(photo)}
          >
            <div className="aspect-[3/4] md:aspect-[16/10]">
              <img src={`${photo.url}?t=${photo.uploadedAt}`} alt="" className="w-full h-full object-contain" loading="lazy" draggable={false} />
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
