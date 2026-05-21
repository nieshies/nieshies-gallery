"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Providers from "../providers";
import ScatterSection from "@/components/sections/ScatterSection";
import { getPhotoUrl } from "@/utils/photo";
import { UploadButton } from "@/components/features/UploadLightbox";

// ── constants ────────────────────────────────────────────────────────────────

const BG       = "#0c0804";
const SURFACE  = "#1a110a";
const BORDER   = "rgba(255,220,180,0.07)";
const LABEL_C  = "rgba(255,220,180,0.32)";

const START  = new Date("2023-12-02T00:00:00");
const TARGET = new Date("2029-10-01T00:00:00");
const TOTAL_MS = TARGET - START;

// ── helpers ──────────────────────────────────────────────────────────────────

function diffYMD(from, to) {
  let y = to.getFullYear() - from.getFullYear();
  let m = to.getMonth()    - from.getMonth();
  let d = to.getDate()     - from.getDate();
  if (d < 0) { m--; d += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  return { y: Math.max(0, y), m: Math.max(0, m), d: Math.max(0, d) };
}

// ── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p style={{
      margin: 0,
      textAlign: "center",
      fontSize: "9px",
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      color: LABEL_C,
      paddingTop: "3.5rem",
      paddingBottom: "0.75rem",
      userSelect: "none",
    }}>
      {children}
    </p>
  );
}

// ── 1. Hero ──────────────────────────────────────────────────────────────────

function AmnHero() {
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    fetch("/api/headers")
      .then((r) => r.json())
      .then((d) => {
        const list = d.photos || [];
        if (list.length) setPhoto(list[Math.floor(Math.random() * list.length)]);
      })
      .catch(() => {});
  }, []);

  return (
    <section style={{
      position: "relative",
      width: "100%",
      height: "62vh",
      minHeight: "300px",
      overflow: "hidden",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {photo && (
        <Image
          src={getPhotoUrl(photo.url, "medium")}
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center", filter: "brightness(0.25) saturate(0.6)" }}
          sizes="100vw"
          priority
        />
      )}

      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, transparent 40%, rgba(19,16,12,0.9) 100%)",
      }} />

      <div style={{
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        pointerEvents: "none",
        padding: "0 1rem",
      }}>
        <h1 style={{
          margin: 0,
          color: "#fff",
          fontWeight: 300,
          fontSize: "clamp(52px, 14vw, 108px)",
          letterSpacing: "0.24em",
        }}>
          AMNIE
        </h1>
        <p style={{
          margin: "0.65rem 0 0",
          color: "rgba(255,255,255,0.22)",
          fontSize: "10px",
          letterSpacing: "0.34em",
          textTransform: "uppercase",
        }}>
          my person · always &amp; forever
        </p>
      </div>
    </section>
  );
}

// ── 2. Dual Countdown ────────────────────────────────────────────────────────

function DigitBox({ digit, color }) {
  return (
    <div style={{
      width: "2.1rem",
      height: "2.7rem",
      background: "rgba(0,0,0,0.4)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "5px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.55rem",
      fontWeight: 600,
      fontFamily: "monospace",
      color,
      lineHeight: 1,
    }}>
      {digit}
    </div>
  );
}

function DigitGroup({ value, label, color }) {
  const str = String(Math.max(0, value)).padStart(2, "0");
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", gap: "3px", justifyContent: "center" }}>
        {str.split("").map((d, i) => <DigitBox key={i} digit={d} color={color} />)}
      </div>
      <p style={{
        margin: "0.35rem 0 0",
        fontSize: "8px",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.22)",
      }}>
        {label}
      </p>
    </div>
  );
}

function CountCard({ title, accent, ymd, progress, sublabel }) {
  return (
    <div style={{
      flex: "1 1 260px",
      background: SURFACE,
      border: `1px solid ${accent}28`,
      borderRadius: "14px",
      padding: "1.6rem 1.4rem 1.4rem",
    }}>
      <p style={{
        margin: "0 0 1.2rem",
        fontSize: "9px",
        letterSpacing: "0.26em",
        textTransform: "uppercase",
        color: accent,
        opacity: 0.7,
      }}>
        {title}
      </p>

      <div style={{
        display: "flex",
        gap: "0.9rem",
        justifyContent: "center",
        marginBottom: "1.1rem",
      }}>
        <DigitGroup value={ymd.y} label="years"  color={accent} />
        <DigitGroup value={ymd.m} label="months" color={accent} />
        <DigitGroup value={ymd.d} label="days"   color={accent} />
      </div>

      <p style={{
        margin: "0 0 0.7rem",
        fontSize: "10px",
        color: "rgba(255,255,255,0.2)",
        textAlign: "center",
        letterSpacing: "0.06em",
      }}>
        {sublabel}
      </p>

      <div style={{
        height: "2px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "1px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          background: accent,
          borderRadius: "1px",
          transformOrigin: "left",
          transform: `scaleX(${Math.max(0, Math.min(100, progress)) / 100})`,
          transition: "transform 1s linear",
          willChange: "transform",
        }} />
      </div>
    </div>
  );
}

function DualCountdown() {
  const [now, setNow] = useState(() => new Date());
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const elapsed   = diffYMD(START, now);
  const remaining = diffYMD(now, TARGET);
  const growPct   = Math.min(100, ((now - START)           / TOTAL_MS) * 100);
  const shrinkPct = Math.max(0,   ((TARGET - now)          / TOTAL_MS) * 100);

  return (
    <section style={{ padding: "0 1.25rem 3.5rem" }}>
      <SectionLabel>timeline</SectionLabel>
      <div style={{
        display: "flex",
        gap: "0.9rem",
        flexWrap: "wrap",
        maxWidth: "680px",
        margin: "0 auto",
      }}>
        <CountCard
          title="together since"
          accent="#e07878"
          ymd={{ y: elapsed.y, m: elapsed.m, d: elapsed.d }}
          progress={growPct}
          sublabel="02 december 2023"
        />
        <CountCard
          title="graduation day"
          accent="#7ec28a"
          ymd={{ y: remaining.y, m: remaining.m, d: remaining.d }}
          progress={shrinkPct}
          sublabel="01 october 2029"
        />
      </div>
    </section>
  );
}

// ── 3. Achievements ──────────────────────────────────────────────────────────

function AchievementsGrid() {
  const [photos, setPhotos] = useState([]);
  const [lightbox, setLightbox] = useState({ open: false, idx: 0 });

  useEffect(() => {
    fetch("/api/photos?page=amnie&folder=achievement")
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!lightbox.open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox((p) => ({ ...p, open: false }));
      if (e.key === "ArrowRight") setLightbox((p) => ({ ...p, idx: Math.min(p.idx + 1, photos.length - 1) }));
      if (e.key === "ArrowLeft")  setLightbox((p) => ({ ...p, idx: Math.max(p.idx - 1, 0) }));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox.open, photos.length]);

  if (photos.length === 0) return null;

  const current = photos[lightbox.idx];

  return (
    <section style={{ padding: "0 1.25rem 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "0.5rem" }}>
        <SectionLabel>milestones</SectionLabel>
        <UploadButton
          defaultSection="amnie-achievement"
          label="+"
          style={{
            marginBottom: "0.75rem",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "1px solid rgba(255,220,180,0.25)",
            background: "transparent",
            color: "rgba(255,220,180,0.5)",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexShrink: 0,
          }}
        />
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "0.65rem",
        maxWidth: "680px",
        margin: "0 auto",
      }}>
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            onClick={() => setLightbox({ open: true, idx: i })}
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3" }}>
              <Image
                src={getPhotoUrl(photo.url, "thumb")}
                alt=""
                fill
                style={{ objectFit: "cover", filter: "brightness(0.82)" }}
                sizes="(max-width: 680px) 50vw, 340px"
                loading="lazy"
              />
            </div>
            {photo.caption && (
              <p style={{
                margin: 0,
                padding: "0.5rem 0.7rem 0.65rem",
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.52)",
                lineHeight: 1.45,
                letterSpacing: "0.02em",
              }}>
                {photo.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {lightbox.open && (
        <div
          onClick={() => setLightbox((p) => ({ ...p, open: false }))}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "min(92vw, 520px)", aspectRatio: "4/3", borderRadius: "14px", overflow: "hidden" }}
          >
            <Image src={getPhotoUrl(current.url, "medium")} alt="" fill style={{ objectFit: "cover" }} sizes="min(92vw, 520px)" priority />
          </div>
          <button
            onClick={() => setLightbox((p) => ({ ...p, open: false }))}
            style={{ position: "absolute", top: "1rem", right: "1.25rem", background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: "28px", cursor: "pointer" }}
          >×</button>
          {lightbox.idx > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox((p) => ({ ...p, idx: p.idx - 1 })); }}
              style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              &#8592;
            </button>
          )}
          {lightbox.idx < photos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox((p) => ({ ...p, idx: p.idx + 1 })); }}
              style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              &#8594;
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// ── 4. Scatter ───────────────────────────────────────────────────────────────

function AmnScatter() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetch("/api/photos?page=amnie&folder=moments")
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {});
  }, []);

  return (
    <section style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "0.5rem" }}>
        <SectionLabel>moments</SectionLabel>
        <UploadButton
          defaultSection="amnie-moments"
          label="+"
          style={{
            marginBottom: "0.75rem",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "1px solid rgba(255,220,180,0.25)",
            background: "transparent",
            color: "rgba(255,220,180,0.5)",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexShrink: 0,
          }}
        />
      </div>
      {photos.length > 0 && <ScatterSection photos={photos} />}
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AmniePage() {
  return (
    <Providers>
      <div style={{ minHeight: "100vh" }}>
        <AmnHero />
        <DualCountdown />
        <AchievementsGrid />
        <AmnScatter />
        <div style={{ height: "4rem" }} />
      </div>
    </Providers>
  );
}
