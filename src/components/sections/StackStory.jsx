"use client";
import useInView from "@/lib/useInView";
import TiltCard from "@/components/features/TiltCard";

export default function StackStory({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.1 });

  if (photos.length === 0) return null;

  return (
    <section ref={ref} className="relative py-8">
      <div className="max-w-xs mx-auto px-4 space-y-4">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(40px)",
              transition: `opacity 0.5s ${i * 0.08}s ease, transform 0.5s ${i * 0.08}s ease`,
            }}
          >
            <TiltCard
              className="rounded-xl overflow-hidden cursor-pointer"
              onClick={() => onPhotoClick?.(photo)}
            >
              <div className="aspect-[3/4]">
                <img src={`${photo.url}?t=${photo.uploadedAt}`} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 30%" }} loading="lazy" draggable={false} />
              </div>
            </TiltCard>
          </div>
        ))}
      </div>
    </section>
  );
}
