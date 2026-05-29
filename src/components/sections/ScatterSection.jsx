"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

const PI2 = Math.PI * 2;

// 3-row layout. Left % values chosen so photos never overflow on a 375px phone
// when using 96px mobile width: max left=73% → 73%×375+96 = 370px < 375px ✓
// Desktop: 200px wide, 1100px tall  |  Mobile: 96px wide, 650px tall
const POSITIONS = [
  { top:  3, left:  3, rotate: -8 },
  { top:  2, left: 24, rotate:  5 },
  { top:  5, left: 46, rotate: -4 },
  { top:  3, left: 65, rotate:  7 },
  { top: 32, left:  8, rotate:  6 },
  { top: 30, left: 30, rotate: -7 },
  { top: 33, left: 53, rotate:  3 },
  { top: 30, left: 65, rotate: -6 },
  { top: 57, left:  3, rotate: -3 },
  { top: 55, left: 26, rotate:  8 },
  { top: 59, left: 50, rotate: -5 },
  { top: 56, left: 73, rotate:  4 },
];

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
    fetch(`/api/photos?page=${page}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setFetched((d.photos || []).slice(0, 12)))
      .catch(() => {});
  }, [page, propPhotos]);

  useEffect(() => {
    if (photos.length === 0) return;

    const amp   = isMobile ? 3 : 1;   // scale factor applied to each photo's amp
    const rotAmp = isMobile ? 0.4 : 0.8;

    const loop = (ts) => {
      for (let i = 0; i < photos.length; i++) {
        const el = imgRefs.current[i];
        if (!el) continue;
        const { period, phase, amp: baseAmp } = ANIM[i];
        const ω   = PI2 / period;
        const a   = isMobile ? amp : baseAmp;
        const rot = POSITIONS[i].rotate + rotAmp * Math.sin(ω * ts * 1.31 + phase);

        el.style.transform = `translate(${a * Math.sin(ω * ts + phase)}px, ${a * Math.cos(ω * ts * 0.73 + phase)}px) rotate(${rot}deg)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [photos, isMobile]);

  if (photos.length === 0) return null;

  const imgW = isMobile ? 96 : 200;
  const imgH = Math.round(imgW * 16 / 9);
  const containerH = isMobile ? 650 : 1100;

  return (
    <>
      <style>{`
        .sc-wrap {
          transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .sc-wrap:hover {
          transform: scale(1.08) !important;
        }
      `}</style>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: `${containerH}px`,
          overflow: "hidden",
        }}
      >
        {photos.map((photo, i) => {
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
                  height: `${imgH}px`,
                  borderRadius: "12px",
                  overflow: "hidden",
                  willChange: "transform",
                  transform: `rotate(${rotate}deg)`,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
                }}
              >
                <Image
                  src={getPhotoUrl(photo.url, "thumb")}
                  alt={photo.caption || ""}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes={isMobile ? "96px" : "200px"}
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
