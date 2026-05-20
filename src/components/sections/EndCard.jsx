"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

// Each row sums to 4 columns: [2+1+1], [1+1+2], [1+2+1], [2+1+1]
const SPANS = [2, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1];

export default function EndCard() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetch("/api/photos?page=home")
      .then((r) => r.json())
      .then((d) => setPhotos((d.photos || []).slice(0, 12)))
      .catch(() => {});
  }, []);

  if (photos.length === 0) return null;

  return (
    <>
      <style>{`
        .ec-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 220px;
        }
        .ec-item {
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 639px) {
          .ec-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-auto-rows: 160px;
          }
          .ec-item {
            grid-column: span 1 !important;
          }
        }
      `}</style>

      <footer style={{ position: "relative" }}>
        <div className="ec-grid">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="ec-item"
              style={{ gridColumn: `span ${SPANS[i] ?? 1}` }}
            >
              <Image
                src={getPhotoUrl(photo.url, "thumb")}
                alt=""
                fill
                style={{ objectFit: "cover", filter: "brightness(0.62)" }}
                sizes="(max-width: 639px) 50vw, 25vw"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#fff",
              fontWeight: 300,
              fontSize: "clamp(22px, 5vw, 38px)",
              letterSpacing: "0.05em",
              textAlign: "center",
              textShadow: "0 2px 20px rgba(0,0,0,0.6)",
            }}
          >
            more memories soon.
          </p>
        </div>
      </footer>
    </>
  );
}
