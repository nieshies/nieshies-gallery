"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

export default function MasonryGallery({ page = "home" }) {
  const [photos, setPhotos] = useState([]);
  const [lightbox, setLightbox] = useState({ open: false, idx: 0 });
  const itemRefs = useRef([]);
  const overlayRef = useRef(null);
  const lbTouchStart = useRef(null);

  useEffect(() => {
    fetch(`/api/photos?page=${page}`)
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {});
  }, [page]);

  // IntersectionObserver reveal with stagger
  useEffect(() => {
    if (photos.length === 0) return;
    const observers = [];
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.transitionDelay = `${(i % 5) * 55}ms`;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add("mg-revealed");
            obs.disconnect();
          }
        },
        { threshold: 0.05 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [photos]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightbox.open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [lightbox.open]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox.open) return;
    const onKey = (e) => {
      if (e.key === "Escape")
        setLightbox((p) => ({ ...p, open: false }));
      if (e.key === "ArrowRight")
        setLightbox((p) => ({ ...p, idx: Math.min(p.idx + 1, photos.length - 1) }));
      if (e.key === "ArrowLeft")
        setLightbox((p) => ({ ...p, idx: Math.max(p.idx - 1, 0) }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox.open, photos.length]);

  const openLightbox = (idx) => setLightbox({ open: true, idx });
  const closeLightbox = () => setLightbox((p) => ({ ...p, open: false }));

  const navigateLightbox = useCallback(
    (delta) =>
      setLightbox((p) => ({
        ...p,
        idx: Math.max(0, Math.min(photos.length - 1, p.idx + delta)),
      })),
    [photos.length]
  );

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) closeLightbox();
  };

  const handleLbTouchStart = (e) => {
    lbTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleLbTouchEnd = (e) => {
    if (!lbTouchStart.current) return;
    const dx = e.changedTouches[0].clientX - lbTouchStart.current.x;
    const dy = e.changedTouches[0].clientY - lbTouchStart.current.y;
    lbTouchStart.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    navigateLightbox(dx < 0 ? 1 : -1);
  };

  if (photos.length === 0) return null;

  const current = photos[lightbox.idx];
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <>
      <style>{`
        .mg-item {
          break-inside: avoid;
          margin-bottom: 4px;
          cursor: pointer;
          overflow: hidden;
          opacity: 0;
          transform: translateY(12px);
          filter: blur(4px);
          transition: opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease;
        }
        .mg-item.mg-revealed {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0px);
        }
        .mg-inner {
          position: relative;
          aspect-ratio: 9 / 16;
          transition: transform 0.3s ease;
        }
        .mg-item:hover .mg-inner {
          transform: scale(1.03);
        }
        .mg-grid {
          column-count: 2;
          column-gap: 4px;
        }
        @media (min-width: 640px) {
          .mg-grid { column-count: 3; }
        }
        @media (min-width: 1024px) {
          .mg-grid { column-count: 4; }
        }
      `}</style>

      {/* Masonry grid */}
      <div className="mg-grid">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            ref={(el) => { itemRefs.current[i] = el; }}
            className="mg-item"
            onClick={() => openLightbox(i)}
          >
            <div className="mg-inner">
              <Image
                src={getPhotoUrl(photo.url, "thumb")}
                alt={photo.caption || ""}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          onTouchStart={handleLbTouchStart}
          onTouchEnd={handleLbTouchEnd}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.93)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Counter */}
          <span
            style={{
              position: "absolute",
              top: "1rem",
              left: "1.25rem",
              color: "rgba(255,255,255,0.35)",
              fontSize: "11px",
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              pointerEvents: "none",
            }}
          >
            {pad(lightbox.idx + 1)}/{pad(photos.length)}
          </span>

          {/* Close */}
          <button
            onClick={closeLightbox}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "1rem",
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: "30px",
              lineHeight: 1,
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            ×
          </button>

          {/* Prev */}
          {lightbox.idx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
              aria-label="Previous"
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(6px)",
                color: "#fff",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              &#8592;
            </button>
          )}

          {/* Next */}
          {lightbox.idx < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
              aria-label="Next"
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(6px)",
                color: "#fff",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              &#8594;
            </button>
          )}

          {/* Photo */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "min(90vw, 56.25vh)",
              aspectRatio: "9 / 16",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <Image
              src={getPhotoUrl(current.url, "full")}
              alt={current.caption || ""}
              fill
              style={{ objectFit: "cover" }}
              sizes="min(90vw, 56.25vh)"
              priority
            />
            {current.caption && (
              <p
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  left: "1rem",
                  right: "1rem",
                  margin: 0,
                  color: "rgba(255,255,255,0.88)",
                  fontSize: "13px",
                  fontStyle: "italic",
                  lineHeight: 1.45,
                  textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                  pointerEvents: "none",
                }}
              >
                {current.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
