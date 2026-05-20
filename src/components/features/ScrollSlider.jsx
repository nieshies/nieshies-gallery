"use client";
import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { getPhotoUrl } from "@/utils/photo";

export default function ScrollSlider({ photos: propPhotos }) {
  const [fetched, setFetched] = useState([]);
  const photos = propPhotos ?? fetched;
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [slots, setSlots] = useState({ a: null, b: null, active: "a" });

  useEffect(() => {
    if (propPhotos !== undefined) return;
    fetch("/api/photos?page=home")
      .then((r) => r.json())
      .then((d) => setFetched(d.photos || []))
      .catch(() => {});
  }, [propPhotos]);

  // Double-buffer: load incoming photo into inactive slot, then flip active
  useEffect(() => {
    if (photos.length === 0) return;
    const photo = photos[idx];
    setSlots((prev) => {
      if (prev.a === null) return { a: photo, b: null, active: "a" };
      const incoming = prev.active === "a" ? "b" : "a";
      return { ...prev, [incoming]: photo, active: incoming };
    });
  }, [idx, photos]);

  // Auto-advance; tick resets the interval on manual nav
  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % photos.length), 5000);
    return () => clearInterval(id);
  }, [photos.length, tick]);

  const navigate = (delta) => {
    setIdx((prev) => ((prev + delta) % photos.length + photos.length) % photos.length);
    setTick((t) => t + 1);
  };

  if (photos.length === 0) return null;

  const { a, b, active } = slots;
  const current = active === "a" ? a : b;

  const imgStyle = (visible) => ({
    objectFit: "cover",
    objectPosition: "center",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.9s ease-in-out",
    willChange: "opacity",
  });

  return (
    <>
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-10px); }
        }
        .sl-card { animation: floatCard 4.5s ease-in-out infinite; will-change: transform; }
        .sl-dot  { cursor: pointer; transition: all 0.3s ease; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem 1.5rem 2.5rem" }}>
        <div
          className="sl-card"
          style={{
            position: "relative",
            width: "min(90vw, 900px)",
            aspectRatio: "16/9",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 28px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {a && (
            <NextImage
              src={getPhotoUrl(a.url, "medium")}
              alt=""
              fill
              style={imgStyle(active === "a")}
              sizes="min(90vw, 900px)"
              priority
            />
          )}
          {b && (
            <NextImage
              src={getPhotoUrl(b.url, "medium")}
              alt=""
              fill
              style={imgStyle(active === "b")}
              sizes="min(90vw, 900px)"
              loading="lazy"
            />
          )}

          {/* Caption */}
          {current?.caption && (
            <p
              style={{
                position: "absolute",
                bottom: "1.25rem",
                left: "1.25rem",
                right: "5rem",
                margin: 0,
                zIndex: 5,
                color: "rgba(255,255,255,0.88)",
                fontSize: "clamp(10px, 1.2vw, 13px)",
                fontStyle: "italic",
                textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                pointerEvents: "none",
              }}
            >
              {current.caption}
            </p>
          )}

          {/* Prev */}
          {photos.length > 1 && (
            <button
              onClick={() => navigate(-1)}
              aria-label="Previous"
              style={{
                position: "absolute", left: "0.85rem", top: "50%",
                transform: "translateY(-50%)", zIndex: 10,
                width: 36, height: 36, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.38)", backdropFilter: "blur(6px)",
                color: "#fff", fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >&#8592;</button>
          )}

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={() => navigate(1)}
              aria-label="Next"
              style={{
                position: "absolute", right: "0.85rem", top: "50%",
                transform: "translateY(-50%)", zIndex: 10,
                width: 36, height: 36, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.38)", backdropFilter: "blur(6px)",
                color: "#fff", fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >&#8594;</button>
          )}

          {/* Dot indicators */}
          <div style={{
            position: "absolute", bottom: "1rem", right: "1.25rem",
            display: "flex", gap: "5px", zIndex: 10,
          }}>
            {photos.map((_, i) => (
              <div
                key={i}
                className="sl-dot"
                onClick={() => { setIdx(i); setTick((t) => t + 1); }}
                style={{
                  width: i === idx ? 18 : 5,
                  height: 5,
                  borderRadius: "3px",
                  background: i === idx ? "#fff" : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
