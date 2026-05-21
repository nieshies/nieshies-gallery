"use client";
import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { getPhotoUrl } from "@/utils/photo";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HeroSection({
  fetchUrl   = "/api/headers",
  title      = "NIESHIES’ DUMP",
  subtitle   = "moments · memories · real",
}) {
  const [photos, setPhotos] = useState([]);
  const [slots, setSlots] = useState({ a: null, b: null, active: "a" });
  const idxRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetch(fetchUrl, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const shuffled = shuffle(d.photos || []);
        setPhotos(shuffled);
        if (shuffled.length > 0) {
          setSlots({ a: shuffled[0], b: null, active: "a" });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (photos.length < 2) return;

    const advance = () => {
      const nextIdx = (idxRef.current + 1) % photos.length;
      const nextPhoto = photos[nextIdx];
      const nextUrl = getPhotoUrl(nextPhoto.url, "medium");

      let committed = false;
      const commit = () => {
        if (committed) return;
        committed = true;
        idxRef.current = nextIdx;
        setSlots((prev) => {
          const incoming = prev.active === "a" ? "b" : "a";
          return { ...prev, [incoming]: nextPhoto, active: incoming };
        });
      };

      const img = new Image();
      img.onload = commit;
      img.onerror = commit;
      img.src = nextUrl;
      if (img.complete) commit();
    };

    intervalRef.current = setInterval(advance, 5000);
    return () => clearInterval(intervalRef.current);
  }, [photos]);

  if (photos.length === 0) return null;

  const urlA = slots.a ? getPhotoUrl(slots.a.url, "medium") : null;
  const urlB = slots.b ? getPhotoUrl(slots.b.url, "medium") : null;
  const isAActive = slots.active === "a";

  const imgStyle = (visible) => ({
    objectFit: "cover",
    objectPosition: "center center",
    filter: "brightness(0.58) saturate(0.85)",
    opacity: visible ? 1 : 0,
    transition: "opacity 1.2s ease-in-out",
    willChange: "opacity",
  });

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      {urlA && <NextImage src={urlA} alt="" fill style={imgStyle(isAActive)} sizes="100vw" priority />}
      {urlB && <NextImage src={urlB} alt="" fill style={imgStyle(!isAActive)} sizes="100vw" />}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 40%, rgba(19,16,12,0.95) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: "#fff",
            fontWeight: 300,
            fontSize: "clamp(32px, 6vw, 72px)",
            letterSpacing: "0.18em",
            textAlign: "center",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.25)",
            fontSize: "clamp(9px, 1.2vw, 13px)",
            letterSpacing: "0.26em",
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
}
