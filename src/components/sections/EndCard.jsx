"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

// Rows: [3+1], [2+2], [1+2+1], [1+1+2], [2+2] — varied widths, each row = 4 cols
const SPANS = [3, 1, 2, 2, 1, 2, 1, 1, 1, 2, 2, 2];

export default function EndCard({ photos: propPhotos }) {
  const [fetched, setFetched] = useState([]);

  useEffect(() => {
    if (propPhotos !== undefined) return;
    fetch("/api/photos?page=home")
      .then((r) => r.json())
      .then((d) => setFetched(d.photos || []))
      .catch(() => {});
  }, [propPhotos]);

  const photos = (propPhotos ?? fetched).slice(0, 12);

  if (photos.length === 0) return null;

  return (
    <>
      <style>{`
        .ec-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 220px;
          gap: 8px;
        }
        .ec-item {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }
        @media (max-width: 639px) {
          .ec-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-auto-rows: 150px;
            gap: 6px;
          }
          .ec-item { grid-column: span 1 !important; }
        }
      `}</style>

      <footer style={{ position: "relative", padding: "0 0.75rem 4rem" }}>
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
            inset: "0 0.75rem 4rem",
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
              fontSize: "clamp(22px, 5vw, 42px)",
              letterSpacing: "0.04em",
              textAlign: "center",
              textShadow: "0 2px 24px rgba(0,0,0,0.7)",
            }}
          >
            more memories soon.
          </p>
        </div>
      </footer>
    </>
  );
}
