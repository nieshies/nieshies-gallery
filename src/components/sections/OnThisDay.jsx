"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function yearsLabel(n) {
  if (n <= 0) return "today";
  if (n === 1) return "1 year ago today";
  return `${n} years ago today`;
}

export default function OnThisDay({ page = "home" }) {
  const [photos, setPhotos]   = useState([]);
  const [idx,    setIdx]      = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch(`/api/photos/on-this-day?page=${page}`)
      .then(r => r.json())
      .then(d => setPhotos(d.photos || []))
      .catch(() => {});
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // auto-cycle every 7s when there's more than one match
  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => setIdx(p => (p + 1) % photos.length), 7000);
    return () => clearInterval(t);
  }, [photos.length]);

  if (photos.length === 0) return null;

  const photo = photos[idx];
  const d     = new Date(photo.uploadedAt);
  const month = MONTHS[d.getMonth()];
  const day   = String(d.getDate()).padStart(2, "0");
  const year  = d.getFullYear();

  return (
    <>
      <style>{`
        .otd-wrap {
          display: flex;
          justify-content: center;
          padding: 48px 16px 28px;
        }
        @media (min-width: 640px) {
          .otd-wrap { padding: 80px 24px 48px; }
        }

        .otd-stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          opacity: ${mounted ? 1 : 0};
          transform: translateY(${mounted ? "0" : "10px"});
          transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .otd-frame {
          position: relative;
          width: 100%;
          max-width: 300px;
          background: linear-gradient(180deg, #f7eedd 0%, #ebdfc8 100%);
          padding: 12px 12px 56px;
          box-shadow:
            0 1px 1px rgba(0,0,0,0.4),
            0 14px 30px rgba(0,0,0,0.5),
            0 28px 70px rgba(0,0,0,0.4);
          transform: rotate(-1.8deg);
          transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .otd-frame:hover {
          transform: rotate(0deg) translateY(-6px) scale(1.02);
        }
        @media (min-width: 640px) {
          .otd-frame { max-width: 360px; padding: 16px 16px 68px; }
        }

        .otd-img {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #110b08;
          overflow: hidden;
        }
        .otd-img::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.18) 100%);
          pointer-events: none;
        }

        .otd-stamp {
          position: absolute;
          top: 22px;
          right: 22px;
          padding: 4px 8px 3px;
          background: rgba(0,0,0,0.55);
          color: rgba(255,200,150,0.9);
          font-family: ui-monospace, "SF Mono", Menlo, monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          border: 1px solid rgba(255,200,150,0.3);
          z-index: 2;
          line-height: 1;
        }

        .otd-caption {
          margin: 14px 8px 0;
          text-align: center;
          color: #5b4a37;
          font-size: 1.05rem;
          line-height: 1.2;
          letter-spacing: 0.01em;
          font-family: "Caveat", "Bradley Hand", "Comic Sans MS", cursive;
        }

        .otd-meta {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(91,74,55,0.65);
          white-space: nowrap;
          max-width: 90%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .otd-dots {
          display: flex; gap: 7px; justify-content: center;
        }
        .otd-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(244,140,54,0.18);
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .otd-dot.active {
          background: rgba(244,140,54,0.75);
          transform: scale(1.4);
        }

        .otd-fade-key { animation: otdFadeIn 0.7s ease; }
        @keyframes otdFadeIn {
          from { opacity: 0; transform: translateY(8px) rotate(-1.8deg); }
          to   { opacity: 1; transform: translateY(0)   rotate(-1.8deg); }
        }
      `}</style>

      <div className="otd-wrap">
        <div className="otd-stack">
          <div className="otd-frame otd-fade-key" key={photo.id}>
            <div className="otd-stamp">{month} {day} '{String(year).slice(2)}</div>
            <div className="otd-img">
              <Image
                src={getPhotoUrl(photo.url, "medium")}
                alt={photo.caption || ""}
                fill
                sizes="(max-width: 640px) 300px, 360px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <p className="otd-caption">{yearsLabel(photo.yearsAgo)}</p>
            <span className="otd-meta">{photo.caption || `${month} ${day}, ${year}`}</span>
          </div>

          {photos.length > 1 && (
            <div className="otd-dots" aria-hidden>
              {photos.map((_, i) => (
                <span key={i} className={`otd-dot ${i === idx ? "active" : ""}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
