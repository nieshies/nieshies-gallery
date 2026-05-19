"use client";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

export default function CollageGrid({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.05 });
  if (photos.length === 0) return null;

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid grid-cols-6 gap-3">
          {photos.slice(0, 12).map((photo, i) => {
            const spans = [
              "col-span-3 row-span-2",
              "col-span-2 row-span-3",
              "col-span-1 row-span-1",
              "col-span-2 row-span-2",
              "col-span-1 row-span-2",
              "col-span-1 row-span-1",
              "col-span-2 row-span-1",
              "col-span-1 row-span-1",
              "col-span-1 row-span-2",
              "col-span-3 row-span-1",
              "col-span-2 row-span-2",
              "col-span-1 row-span-1",
            ][i % 12];
            return (
              <div
                key={photo.id}
                className={spans}
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "scale(1)" : "scale(0.92)",
                  transition: `opacity 0.5s ${i * 0.04}s ease, transform 0.5s ${i * 0.04}s ease`,
                }}
              >
                <PhotoCard photo={photo} onClick={onPhotoClick} aspect="4/5" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
