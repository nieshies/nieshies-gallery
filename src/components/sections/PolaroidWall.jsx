"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

const MONTHS_FULL = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${MONTHS_FULL[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// stable pseudo-random rotation per index (deterministic across renders)
function tiltFor(i) {
  const seed = (i * 9973 + 7) % 10000;
  return ((seed / 10000) * 12) - 6; // -6° to +6°
}

export default function PolaroidWall({ photos = [] }) {
  const [flipped,  setFlipped]  = useState(() => new Set());
  const [revealed, setRevealed] = useState(() => new Set());
  const itemRefs = useRef([]);

  // staggered reveal on scroll into view
  useEffect(() => {
    if (photos.length === 0) return;
    const observers = [];
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.transitionDelay = `${i * 70}ms`;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(prev => {
            const n = new Set(prev);
            n.add(i);
            return n;
          });
          obs.disconnect();
        }
      }, { threshold: 0.12 });
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [photos]);

  const toggleFlip = i => {
    setFlipped(prev => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  const onKey = (e, i) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip(i);
    }
  };

  if (photos.length === 0) return null;

  return (
    <>
      <style>{`
        .pw-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 26px;
          padding: 28px 14px 36px;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (min-width: 640px) {
          .pw-grid { grid-template-columns: repeat(3, 1fr); gap: 36px; padding: 40px 24px 48px; }
        }
        @media (min-width: 1024px) {
          .pw-grid { grid-template-columns: repeat(4, 1fr); gap: 42px; padding: 48px 32px 56px; }
        }

        .pw-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
          perspective: 1400px;
          -webkit-perspective: 1400px;
        }
        .pw-wrap.pw-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        .pw-card {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          transition: transform 0.85s cubic-bezier(0.4, 0.0, 0.2, 1);
          cursor: pointer;
        }
        .pw-card.pw-flipped { transform: rotateY(180deg); }

        .pw-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 2px;
          box-shadow:
            0 1px 1px rgba(0,0,0,0.45),
            0 10px 22px rgba(0,0,0,0.55),
            0 22px 45px rgba(0,0,0,0.45);
          overflow: hidden;
        }

        /* Front: polaroid frame */
        .pw-front {
          background: linear-gradient(180deg, #f7eedd 0%, #ecdfc8 100%);
          padding: 9px 9px 38px;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 640px) {
          .pw-front { padding: 11px 11px 46px; }
        }
        .pw-front-img {
          position: relative;
          flex: 1;
          background: #110a06;
          overflow: hidden;
        }
        .pw-front-img::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.18) 100%);
          pointer-events: none;
        }
        .pw-front-caption {
          margin: 8px 4px 0;
          color: #5b4a37;
          font-size: 0.78rem;
          font-family: "Caveat", "Bradley Hand", "Comic Sans MS", cursive;
          text-align: center;
          line-height: 1.1;
          letter-spacing: 0.02em;
          min-height: 18px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (min-width: 640px) {
          .pw-front-caption { font-size: 0.88rem; }
        }

        /* Back: dark warm note */
        .pw-back {
          transform: rotateY(180deg);
          background:
            radial-gradient(ellipse at top, rgba(244,140,54,0.10), transparent 65%),
            linear-gradient(180deg, #1b1410 0%, #0d0807 100%);
          border: 1px solid rgba(244,140,54,0.18);
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #d4b48f;
        }
        @media (min-width: 640px) {
          .pw-back { padding: 28px 22px; }
        }
        .pw-back-header {
          font-size: 9px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(244,140,54,0.5);
          text-align: center;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(244,140,54,0.18);
        }
        .pw-back-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px 4px;
        }
        .pw-back-caption {
          margin: 0;
          font-style: italic;
          font-size: 0.85rem;
          line-height: 1.55;
          text-align: center;
          color: rgba(255,255,255,0.82);
          letter-spacing: 0.02em;
        }
        .pw-back-empty {
          color: rgba(255,255,255,0.32);
        }
        @media (min-width: 640px) {
          .pw-back-caption { font-size: 0.95rem; }
        }
        .pw-back-date {
          text-align: center;
          font-size: 9px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(244,140,54,0.55);
        }
        .pw-back-corner {
          position: absolute;
          top: 8px; right: 10px;
          font-size: 9px;
          color: rgba(244,140,54,0.35);
          font-family: ui-monospace, monospace;
          letter-spacing: 0.15em;
        }

        .pw-hint {
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(244,140,54,0.35);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s ease;
          white-space: nowrap;
        }
        .pw-wrap:hover .pw-hint { opacity: 1; }
        @media (hover: none) {
          .pw-hint { opacity: 0.45; }
        }
      `}</style>

      <div className="pw-grid">
        {photos.map((photo, i) => {
          const rot       = tiltFor(i);
          const isFlipped = flipped.has(i);
          const isShown   = revealed.has(i);
          const date      = formatDate(photo.uploadedAt);

          return (
            <div
              key={photo.id}
              ref={el => { itemRefs.current[i] = el; }}
              className={`pw-wrap ${isShown ? "pw-revealed" : ""}`}
              style={{ transform: isShown
                ? `translateY(0) rotate(${rot}deg)`
                : `translateY(14px) rotate(${rot}deg)` }}
            >
              <div
                className={`pw-card ${isFlipped ? "pw-flipped" : ""}`}
                onClick={() => toggleFlip(i)}
                onKeyDown={e => onKey(e, i)}
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
                aria-label={isFlipped ? "Show photo" : "Show memory"}
              >
                {/* Front */}
                <div className="pw-face pw-front">
                  <div className="pw-front-img">
                    <Image
                      src={getPhotoUrl(photo.url, "thumb")}
                      alt={photo.caption || ""}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      style={{ objectFit: "cover" }}
                      loading="lazy"
                    />
                  </div>
                  <div className="pw-front-caption">{photo.caption || "·"}</div>
                </div>

                {/* Back */}
                <div className="pw-face pw-back">
                  {date && <span className="pw-back-corner">{date.split(",")[1]?.trim() || ""}</span>}
                  <div className="pw-back-header">memory</div>
                  <div className="pw-back-body">
                    {photo.caption ? (
                      <p className="pw-back-caption">{photo.caption}</p>
                    ) : (
                      <p className="pw-back-caption pw-back-empty">
                        no story written for this one yet.
                      </p>
                    )}
                  </div>
                  <div className="pw-back-date">{date}</div>
                </div>
              </div>

              <span className="pw-hint">
                {isFlipped ? "tap to close" : "tap to flip"}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
