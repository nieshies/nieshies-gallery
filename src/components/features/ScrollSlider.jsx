"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { getPhotoUrl } from "@/utils/photo";

const pad = (n) => String(n).padStart(2, "0");

export default function ScrollSlider() {
  const [photos, setPhotos] = useState([]);
  const [idx, setIdx] = useState(0);

  const idxRef = useRef(0);
  const lenRef = useRef(0);
  const lockedRef = useRef(false);
  const lockTimer = useRef(null);
  const touchStartX = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetch("/api/photos?page=home")
      .then((r) => r.json())
      .then((d) => {
        const list = d.photos || [];
        setPhotos(list);
        lenRef.current = list.length;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => clearTimeout(lockTimer.current);
  }, []);

  const advance = useCallback((delta) => {
    if (lockedRef.current) return;
    const next = Math.max(0, Math.min(lenRef.current - 1, idxRef.current + delta));
    if (next === idxRef.current) return;
    lockedRef.current = true;
    idxRef.current = next;
    setIdx(next);
    clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => { lockedRef.current = false; }, 500);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      advance(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [advance]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    advance(dx < 0 ? 1 : -1);
  };

  if (photos.length === 0) return null;

  const n = photos.length;
  const slideW = 100 / n;

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ position: "relative", overflow: "hidden", width: "100%", userSelect: "none" }}
    >
      {/* Slide track */}
      <div
        style={{
          display: "flex",
          width: `${n * 100}%`,
          transform: `translateX(calc(-${idx} * ${slideW}%))`,
          transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)",
          willChange: "transform",
        }}
      >
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            style={{
              width: `${slideW}%`,
              flex: "0 0 auto",
              position: "relative",
              height: "min(70vh, 580px)",
              filter: i === idx ? "brightness(1)" : "brightness(0.55)",
              transition: "filter 0.5s ease",
            }}
          >
            <img
              src={getPhotoUrl(photo.url, "medium")}
              alt={photo.caption || ""}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading={i < 3 ? "eager" : "lazy"}
              draggable={false}
            />

            {photo.caption && (
              <p
                style={{
                  position: "absolute",
                  bottom: "1.5rem",
                  left: "1.5rem",
                  right: "3rem",
                  margin: 0,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "clamp(11px, 1.4vw, 14px)",
                  fontStyle: "italic",
                  lineHeight: 1.45,
                  textShadow: "0 1px 10px rgba(0,0,0,0.9)",
                }}
              >
                {photo.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Counter */}
      <span
        style={{
          position: "absolute",
          top: "1rem",
          right: "1.25rem",
          zIndex: 10,
          color: "rgba(255,255,255,0.5)",
          fontSize: "11px",
          fontFamily: "monospace",
          letterSpacing: "0.12em",
          pointerEvents: "none",
        }}
      >
        {pad(idx + 1)}/{pad(n)}
      </span>

      {/* Arrow buttons */}
      {idx > 0 && (
        <button
          onClick={() => advance(-1)}
          aria-label="Previous photo"
          style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.42)",
            backdropFilter: "blur(6px)",
            color: "#fff",
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          &#8592;
        </button>
      )}
      {idx < n - 1 && (
        <button
          onClick={() => advance(1)}
          aria-label="Next photo"
          style={{
            position: "absolute",
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.42)",
            backdropFilter: "blur(6px)",
            color: "#fff",
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          &#8594;
        </button>
      )}
    </div>
  );
}
