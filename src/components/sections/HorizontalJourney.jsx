"use client";

export default function HorizontalJourney({ photos, onPhotoClick }) {
  if (photos.length === 0) return null;
  const loopPhotos = [...photos, ...photos];

  return (
    <section className="relative overflow-hidden py-20">
      <div className="flex min-h-[80vh] items-center overflow-hidden">
        <div
          className="horizontal-loop-track flex gap-6 px-6"
          style={{ willChange: "transform" }}
        >
          {loopPhotos.map((photo, index) => (
            <div
              key={`${photo.id}-${index}`}
              className="shrink-0 cursor-pointer"
              style={{ width: "min(36rem, 84vw)" }}
              onClick={() => onPhotoClick?.(photo)}
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[var(--glass)] shadow-glass backdrop-blur-md" style={{ aspectRatio: "4/3" }}>
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={`${photo.url}?t=${photo.uploadedAt}`}
                    alt=""
                    loading="lazy"
                    className="object-cover"
                    style={{ position: "absolute", height: "100%", width: "100%", inset: 0 }}
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
