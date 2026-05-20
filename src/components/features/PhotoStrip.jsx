"use client";
import { useEffect, useState } from "react";
import { getPhotoUrl } from "@/utils/photo";

export default function PhotoStrip() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetch("/api/photos?page=home")
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {});
  }, []);

  if (photos.length === 0) return null;

  const doubled = [...photos, ...photos];

  return (
    <>
      <style>{`
        @keyframes scrollLoop {
          from { transform: translateX(0) translateZ(0); }
          to   { transform: translateX(-50%) translateZ(0); }
        }
        .ps-track {
          animation: scrollLoop 22s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        .ps-track:hover {
          animation-play-state: paused;
        }
        .ps-img {
          filter: brightness(0.82);
          transition: filter 0.35s ease, transform 0.35s ease;
        }
        .ps-img:hover {
          filter: brightness(1);
          transform: scale(1.04);
        }
      `}</style>

      <div style={{ overflow: "hidden", width: "100%" }}>
        <div
          className="ps-track"
          style={{
            display: "flex",
            gap: "6px",
            width: "max-content",
          }}
        >
          {doubled.map((photo, i) => (
            <img
              key={`${photo.id}-${i}`}
              src={getPhotoUrl(photo.url, "thumb")}
              alt=""
              className="ps-img"
              style={{
                width: "110px",
                height: "auto",
                borderRadius: "8px",
                flexShrink: 0,
                display: "block",
              }}
              loading="lazy"
              draggable={false}
            />
          ))}
        </div>
      </div>
    </>
  );
}
