"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

export default function PhotoStrip({ photos: propPhotos }) {
  const [fetched, setFetched] = useState([]);

  useEffect(() => {
    if (propPhotos !== undefined) return;
    fetch("/api/photos?page=home")
      .then((r) => r.json())
      .then((d) => setFetched(d.photos || []))
      .catch(() => {});
  }, [propPhotos]);

  const photos = propPhotos ?? fetched;
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
          animation: scrollLoop 28s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        .ps-track:hover {
          animation-play-state: paused;
        }
        .ps-wrap {
          position: relative;
          width: 140px;
          height: 249px;
          flex-shrink: 0;
          border-radius: 10px;
          overflow: hidden;
          transition: transform 0.35s ease;
        }
        .ps-wrap:hover {
          transform: scale(1.04);
        }
        .ps-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.18);
          transition: opacity 0.35s ease;
          pointer-events: none;
          will-change: opacity;
        }
        .ps-wrap:hover .ps-overlay {
          opacity: 0;
        }
        @media (max-width: 640px) {
          .ps-wrap { width: 100px; height: 178px; }
          .ps-track { animation-duration: 22s; }
        }
      `}</style>

      <div style={{ overflow: "hidden", width: "100%" }}>
        <div className="ps-track" style={{ display: "flex", gap: "6px", width: "max-content" }}>
          {doubled.map((photo, i) => (
            <div key={`${photo.id}-${i}`} className="ps-wrap">
              <Image
                src={getPhotoUrl(photo.url, "thumb")}
                alt=""
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 640px) 100px, 140px"
                loading="lazy"
                draggable={false}
              />
              <div className="ps-overlay" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
