"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

const PI2 = Math.PI * 2;

const POSITIONS = [
  { top:  8, left:  5, rotate: -8 },
  { top:  6, left: 28, rotate:  4 },
  { top: 12, left: 55, rotate: -3 },
  { top:  5, left: 78, rotate:  7 },
  { top: 35, left: 10, rotate:  5 },
  { top: 40, left: 38, rotate: -6 },
  { top: 32, left: 65, rotate:  3 },
  { top: 38, left: 85, rotate: -9 },
  { top: 62, left:  3, rotate: -4 },
  { top: 68, left: 22, rotate:  8 },
  { top: 60, left: 50, rotate: -5 },
  { top: 65, left: 75, rotate:  6 },
];

// period in ms (3–5s), phase offset, desktop amplitude (5–10px)
const ANIM = [
  { period: 3200, phase: 0.00, amp:  8 },
  { period: 4500, phase: 1.30, amp:  6 },
  { period: 3800, phase: 2.10, amp: 10 },
  { period: 5000, phase: 0.70, amp:  5 },
  { period: 3500, phase: 3.00, amp:  7 },
  { period: 4200, phase: 1.80, amp:  9 },
  { period: 3100, phase: 4.20, amp:  6 },
  { period: 4800, phase: 2.50, amp:  8 },
  { period: 3700, phase: 5.10, amp:  5 },
  { period: 5000, phase: 0.30, amp: 10 },
  { period: 3300, phase: 3.70, amp:  7 },
  { period: 4100, phase: 1.10, amp:  6 },
];

export default function ScatterSection({ page = "home", photos: propPhotos }) {
  const [fetched, setFetched] = useState([]);
  const photos = (propPhotos ?? fetched).slice(0, 12);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const imgRefs = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (propPhotos !== undefined) return;
    fetch(`/api/photos?page=${page}`)
      .then((r) => r.json())
      .then((d) => setFetched((d.photos || []).slice(0, 12)))
      .catch(() => {});
  }, [page, propPhotos]);

  useEffect(() => {
    if (photos.length === 0) return;

    const count = isMobile ? Math.min(8, photos.length) : photos.length;
    const mobileAmp = 3;
    const rotAmp = isMobile ? 0.4 : 0.8;

    const loop = (ts) => {
      for (let i = 0; i < count; i++) {
        const el = imgRefs.current[i];
        if (!el) continue;
        const { period, phase, amp } = ANIM[i];
        const ω = PI2 / period;
        const a = isMobile ? mobileAmp : amp;
        const baseRot = POSITIONS[i].rotate;

        const tx = a * Math.sin(ω * ts + phase);
        const ty = a * Math.cos(ω * ts * 0.73 + phase);
        const rot = baseRot + rotAmp * Math.sin(ω * ts * 1.31 + phase);

        el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [photos, isMobile]);

  if (photos.length === 0) return null;

  const count = isMobile ? Math.min(8, photos.length) : photos.length;
  const imgW = isMobile ? 90 : 140;

  return (
    <>
      <style>{`
        .sc-wrap {
          transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .sc-wrap:hover {
          transform: scale(1.1);
        }
      `}</style>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(400px, 58vh, 660px)",
          overflow: "hidden",
        }}
      >
        {photos.slice(0, count).map((photo, i) => {
          const { top, left, rotate } = POSITIONS[i];
          return (
            <div
              key={photo.id}
              className="sc-wrap"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(-1)}
              style={{
                position: "absolute",
                top: `${top}%`,
                left: `${left}%`,
                zIndex: hoveredIdx === i ? 20 : 5 + i,
              }}
            >
              <div
                ref={(el) => { imgRefs.current[i] = el; }}
                style={{
                  position: "relative",
                  width: `${imgW}px`,
                  height: `${Math.round(imgW * 16 / 9)}px`,
                  borderRadius: "4px",
                  overflow: "hidden",
                  willChange: "transform",
                  transform: `rotate(${rotate}deg)`,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.55)",
                }}
              >
                <Image
                  src={getPhotoUrl(photo.url, "thumb")}
                  alt={photo.caption || ""}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes={`${imgW}px`}
                  draggable={false}
                  loading="lazy"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
