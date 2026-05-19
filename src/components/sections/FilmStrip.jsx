"use client";
import PhotoCard from "@/components/features/PhotoCard";

export default function FilmStrip({ photos, onPhotoClick }) {
  if (photos.length === 0) return null;

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="flex gap-6 pr-6 overflow-x-auto scrollbar-none">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="shrink-0"
            style={{ width: "min(52vw, 360px)" }}
          >
            <PhotoCard
              photo={photo}
              onClick={onPhotoClick}
              aspect="3/4"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
