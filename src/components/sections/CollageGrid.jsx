"use client";
import { useState, useCallback } from "react";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

const ROTATIONS = [ -2, 3, -1, 4, -3, 1, -4, 2, -1, 3, -2, 0 ];
const MARGIN_LEFT = [ 0, -36, -32, 20, -28, -40, 24, -34, -30, 18, -38, -26 ];
const MARGIN_TOP = [ 0, 12, -8, 20, 4, 16, -4, 24, 0, 28, 8, 32 ];

export default function CollageGrid({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.05 });
  const [hovered, setHovered] = useState(null);

  const handleEnter = useCallback((i) => setHovered(i), []);
  const handleLeave = useCallback(() => setHovered(null), []);

  if (photos.length === 0) return null;

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex flex-wrap justify-center">
          {photos.slice(0, 12).map((photo, i) => (
            <div
              key={photo.id}
              className="shrink-0"
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={handleLeave}
              style={{
                marginLeft: `${MARGIN_LEFT[i % 12]}px`,
                marginTop: `${MARGIN_TOP[i % 12]}px`,
                rotate: `${ROTATIONS[i % 12]}deg`,
                zIndex: hovered === i ? 100 : 12 - i,
                opacity: inView ? 1 : 0,
                transform: inView && hovered !== i ? "scale(1)" : hovered === i ? "scale(1.06)" : "scale(0.92)",
                transition: "opacity 0.5s ease, transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), z-index 0s",
              }}
            >
              <div className="w-48 sm:w-52 lg:w-56">
                <PhotoCard photo={photo} onClick={onPhotoClick} aspect="4/5" tilt={false} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
