"use client";
import useInView from "@/lib/useInView";
import TiltCard from "@/components/features/TiltCard";

export default function CollageGrid({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.1 });

  if (photos.length === 0) return null;

  return (
    <section ref={ref} className="relative py-8">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "scale(1)" : "scale(0.9)",
              transition: `opacity 0.5s ${(i % 6) * 0.06}s ease, transform 0.5s ${(i % 6) * 0.06}s ease`,
            }}
          >
            <TiltCard
              className="rounded-xl overflow-hidden cursor-pointer h-full"
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
