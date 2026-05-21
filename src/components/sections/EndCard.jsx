"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

// 4-row layout matching the reference: small top row, growing rows, dramatic bottom
// Row 1 (175px): [1,1,1,1] = 4 photos
// Row 2 (240px): [2,1,1]   = 3 photos
// Row 3 (255px): [1,1,2]   = 3 photos
// Row 4 (340px): [3,1]     = 2 photos
const SPANS = [1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 3, 1];

// Unique parallax depth per photo — farther-indexed photos move more for depth illusion
const DEPTH = [0.006, 0.010, 0.005, 0.009, 0.012, 0.007, 0.008, 0.004, 0.011, 0.006, 0.009, 0.007];

export default function EndCard({ photos: propPhotos }) {
  const [fetched, setFetched] = useState([]);
  const containerRef = useRef(null);
  const innerRefs = useRef([]);

  useEffect(() => {
    if (propPhotos !== undefined) return;
    fetch("/api/photos?page=home")
      .then((r) => r.json())
      .then((d) => setFetched(d.photos || []))
      .catch(() => {});
  }, [propPhotos]);

  const photos = (propPhotos ?? fetched).slice(0, 12);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    innerRefs.current.forEach((el, i) => {
      if (!el) return;
      const f = DEPTH[i] ?? 0.006;
      el.style.transform = `translate(${dx * f}px, ${dy * f}px)`;
    });
  };

  const handleMouseLeave = () => {
    innerRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transform = "translate(0,0)";
      el.style.transition = "transform 0.6s ease";
      setTimeout(() => { if (el) el.style.transition = ""; }, 600);
    });
  };

  if (photos.length === 0) return null;

  return (
    <>
      <style>{`
        .ec-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: 175px 240px 255px 340px;
          gap: 10px;
        }
        .ec-item {
          position: relative;
          overflow: hidden;
          border-radius: 14px;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.28s ease;
          cursor: default;
        }
        .ec-item:hover {
          transform: scale(1.04);
          box-shadow: 0 20px 60px rgba(0,0,0,0.65);
          z-index: 5;
          position: relative;
        }
        .ec-inner {
          position: absolute;
          inset: -5%;
          transition: transform 0.04s linear;
          will-change: transform;
        }
        @media (max-width: 639px) {
          .ec-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-auto-rows: 145px;
            grid-template-rows: none;
            gap: 7px;
          }
          .ec-item { grid-column: span 1 !important; border-radius: 10px; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .ec-grid {
            grid-template-rows: 145px 200px 210px 280px;
            gap: 8px;
          }
        }
      `}</style>

      <footer
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative", padding: "0 0.75rem 5rem" }}
      >
        <div className="ec-grid">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="ec-item"
              style={{ gridColumn: `span ${SPANS[i] ?? 1}` }}
            >
              <div
                ref={(el) => { innerRefs.current[i] = el; }}
                className="ec-inner"
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
            </div>
          ))}
        </div>

        {/* "more memories soon." overlay */}
        <div
          style={{
            position: "absolute",
            inset: "0 0.75rem 5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#fff",
              fontWeight: 300,
              fontSize: "clamp(24px, 5vw, 50px)",
              letterSpacing: "0.04em",
              textAlign: "center",
              textShadow: "0 2px 32px rgba(0,0,0,0.85)",
            }}
          >
            more memories soon.
          </p>
        </div>
      </footer>
    </>
  );
}
