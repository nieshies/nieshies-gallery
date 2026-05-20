"use client";
import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { getPhotoUrl } from "@/utils/photo";

const DURATION = 3500;
const TICK = 33;

export default function StoryViewer({ photos: propPhotos }) {
  const [fetched, setFetched] = useState([]);
  const photos = propPhotos ?? fetched;
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [slots, setSlots] = useState({ a: null, b: null, active: "a" });
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);

  useEffect(() => {
    if (propPhotos !== undefined) return;
    fetch("/api/photos?page=home")
      .then((r) => r.json())
      .then((d) => setFetched(d.photos || []))
      .catch(() => {});
  }, [propPhotos]);

  // Sync double-buffer slots with current idx
  useEffect(() => {
    if (photos.length === 0) return;
    const photo = photos[idx];
    setSlots((prev) => {
      if (prev.a === null) return { a: photo, b: null, active: "a" };
      const incoming = prev.active === "a" ? "b" : "a";
      return { ...prev, [incoming]: photo, active: incoming };
    });
  }, [idx, photos]);

  // Preload next photo
  useEffect(() => {
    if (idx < photos.length - 1) {
      const img = new window.Image();
      img.src = getPhotoUrl(photos[idx + 1].url, "medium");
    }
  }, [idx, photos]);

  // Progress bar + auto-advance
  useEffect(() => {
    if (photos.length === 0) return;
    setProgress(0);
    let elapsed = 0;

    intervalRef.current = setInterval(() => {
      elapsed += TICK;
      const p = Math.min(elapsed / DURATION, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(intervalRef.current);
        setIdx((prev) => (prev < photos.length - 1 ? prev + 1 : prev));
      }
    }, TICK);

    return () => clearInterval(intervalRef.current);
  }, [idx, photos]);

  const navigate = (delta) => {
    setIdx((prev) => Math.max(0, Math.min(photos.length - 1, prev + delta)));
  };

  const handleInteract = (clientX) => {
    const w = containerRef.current?.offsetWidth ?? 400;
    navigate(clientX / w < 0.45 ? -1 : 1);
  };

  const handleClick = (e) => handleInteract(e.clientX);

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x);
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
    touchStartRef.current = null;
    if (dx > 10 || dy > 10) return;
    e.preventDefault();
    handleInteract(e.changedTouches[0].clientX);
  };

  if (photos.length === 0) return null;

  const { a, b, active } = slots;
  const currentPhoto = active === "a" ? a : b;

  const imgStyle = (visible) => ({
    objectFit: "cover",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.25s ease",
    willChange: "opacity",
  });

  return (
    <>
      <style>{`
        .sv-root {
          position: relative;
          width: min(100%, 56.25vh);
          aspect-ratio: 9 / 16;
          margin: 0 auto;
          background: #000;
          overflow: hidden;
          cursor: pointer;
          user-select: none;
        }
        @media (max-width: 639px) {
          .sv-root { width: 100%; }
        }
      `}</style>
    <div
      ref={containerRef}
      className="sv-root"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Double-buffer images */}
      {a && (
        <NextImage
          src={getPhotoUrl(a.url, "medium")}
          alt=""
          fill
          style={imgStyle(active === "a")}
          sizes="(max-width: 640px) 100vw, 56.25vh"
          priority
          draggable={false}
        />
      )}
      {b && (
        <NextImage
          src={getPhotoUrl(b.url, "medium")}
          alt=""
          fill
          style={imgStyle(active === "b")}
          sizes="(max-width: 640px) 100vw, 56.25vh"
          loading="lazy"
          draggable={false}
        />
      )}

      {/* Top gradient behind progress bars */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "80px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Progress bars */}
      <div
        style={{
          position: "absolute",
          top: "0.75rem",
          left: "0.75rem",
          right: "0.75rem",
          display: "flex",
          gap: "3px",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {photos.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "2px",
              background: "rgba(255,255,255,0.3)",
              borderRadius: "1px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "#fff",
                transformOrigin: "left",
                transform: `scaleX(${i < idx ? 1 : i === idx ? progress : 0})`,
                willChange: "transform",
              }}
            />
          </div>
        ))}
      </div>

      {/* Bottom gradient behind text */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "140px",
          background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Caption */}
      {currentPhoto?.caption && (
        <p
          style={{
            position: "absolute",
            bottom: "2.5rem",
            left: "1rem",
            right: "1rem",
            margin: 0,
            zIndex: 10,
            color: "rgba(255,255,255,0.9)",
            fontSize: "clamp(12px, 3.5vw, 15px)",
            fontStyle: "italic",
            lineHeight: 1.45,
            textShadow: "0 1px 8px rgba(0,0,0,0.8)",
            pointerEvents: "none",
          }}
        >
          {currentPhoto.caption}
        </p>
      )}

      {/* Hint */}
      <p
        style={{
          position: "absolute",
          bottom: "0.85rem",
          left: 0,
          right: 0,
          margin: 0,
          textAlign: "center",
          zIndex: 10,
          color: "rgba(255,255,255,0.28)",
          fontSize: "9px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          pointerEvents: "none",
        }}
      >
        tap anywhere to continue
      </p>
    </div>
    </>
  );
}
