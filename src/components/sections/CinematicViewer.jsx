"use client";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

export default function CinematicViewer({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  if (photos.length === 0) return null;
  const photo = photos[0];

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <PhotoCard photo={photo} onClick={onPhotoClick} aspect="16/10" />
        </div>
      </div>
    </section>
  );
}
