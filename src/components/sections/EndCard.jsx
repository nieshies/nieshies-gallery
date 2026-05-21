"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

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
      el.style.transition = "transform 0.6s ease";
      el.style.transform = "translate(0,0)";
      setTimeout(() => { if (el) el.style.transition = ""; }, 600);
    });
  };

  if (photos.length === 0) return null;

  return (
    <>
      <style>{`
        .ec-masonry {
          column-count: 4;
          column-gap: 10px;
        }
        .ec-item {
          break-inside: avoid;
          margin-bottom: 10px;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.28s ease;
          cursor: default;
        }
        .ec-item:hover {
          transform: scale(1.04);
          box-shadow: 0 20px 60px rgba(0,0,0,0.65);
          z-index: 5;
        }
        .ec-inner {
          position: absolute;
          inset: -5%;
          transition: transform 0.04s linear;
          will-change: transform;
        }
        @media (max-width: 639px) {
          .ec-masonry { column-count: 2; column-gap: 7px; }
          .ec-item { margin-bottom: 7px; border-radius: 10px; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .ec-masonry { column-count: 3; column-gap: 8px; }
        }
      `}</style>

      <footer
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative", padding: "0 0.75rem 5rem" }}
      >
        <div className="ec-masonry">
          {photos.map((photo, i) => {
            const ratio = photo.width && photo.height
              ? `${photo.width}/${photo.height}`
              : "9/16";
            return (
              <div key={photo.id} className="ec-item" style={{ aspectRatio: ratio }}>
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
            );
          })}
        </div>

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
