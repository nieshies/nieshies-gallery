"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Providers from "../providers";
import HeroSection from "@/components/sections/HeroSection";
import ScatterSection from "@/components/sections/ScatterSection";
import { getPhotoUrl } from "@/utils/photo";
import { UploadButton } from "@/components/features/UploadLightbox";
import { useEditorGate } from "@/lib/EditorGate";
import AmnieMusicAmbient from "@/components/features/AmnieMusicAmbient";

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
      color: "transparent",
      paddingTop: "3.5rem",
      paddingBottom: "0.75rem",
      userSelect: "none",
      pointerEvents: "none",
    }}>
      {children}
    </p>
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

// ── 3. Milestones (vertical timeline of polaroids) ───────────────────────────

function MilestonesTimeline() {
  const [photos, setPhotos] = useState([]);
  const [editingCaption, setEditingCaption] = useState(null);
  const [captionDraft,   setCaptionDraft]   = useState("");
  const { ensureEditor, isEditor } = useEditorGate();

  useEffect(() => {
    fetch("/api/photos?page=amnie&folder=achievement")
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {});
  }, []);

  const startEdit = (p) => {
    if (!ensureEditor()) return;
    setEditingCaption(p.url);
    setCaptionDraft(p.caption || "");
  };
  const saveCaption = async (p) => {
    const draft = (captionDraft || "").slice(0, 140);
    setEditingCaption(null);
    setPhotos(prev => prev.map(x => x.url === p.url ? { ...x, caption: draft } : x));
    try {
      await fetch("/api/photos/caption", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: p.url, caption: draft, page: "amnie", folder: "achievement" }),
      });
    } catch {/* keep optimistic */}
  };

  // Latest milestone at top
  const sorted = [...photos].sort((a, b) => {
    const ta = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const tb = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return tb - ta;
  });

  return (
    <section style={{ padding: "0 1.25rem" }}>
      <style>{`
        .ml-head {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 0.5rem;
        }
        .ml-empty {
          text-align: center;
          color: rgba(255, 220, 180, 0.35);
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 20px;
          padding: 60px 0;
        }
        .ml-timeline {
          position: relative;
          max-width: 560px;
          margin: 0 auto;
          padding: 1.25rem 0 0;
        }
        .ml-timeline::before {
          content: "";
          position: absolute;
          top: 18px;
          bottom: 24px;
          left: 70px;
          width: 0.5px;
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(255, 220, 180, 0.18) 6%,
            rgba(255, 220, 180, 0.18) 94%,
            transparent 100%);
        }
        .ml-row {
          display: grid;
          grid-template-columns: 60px 14px 1fr;
          gap: 12px;
          align-items: start;
          margin-bottom: 28px;
          position: relative;
        }
        .ml-year {
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 19px;
          color: rgba(255, 220, 180, 0.8);
          text-align: right;
          padding-top: 16px;
          line-height: 1;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .ml-row.ml-row-newyear .ml-year { opacity: 1; }
        .ml-row.ml-row-newyear { margin-top: 32px; }
        .ml-row.ml-row-newyear:first-child { margin-top: 0; }
        .ml-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(255, 220, 180, 0.35);
          margin: 22px 4px 0;
          position: relative;
          z-index: 2;
          box-shadow: 0 0 0 4px #0c0804;
          transition: background 0.3s, transform 0.3s;
        }
        .ml-row.ml-row-newyear .ml-dot {
          background: rgba(255, 220, 180, 0.8);
          width: 7px; height: 7px;
          margin-top: 21px;
        }
        .ml-polaroid-wrap {
          max-width: 240px;
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ml-polaroid-wrap:hover { transform: rotate(0deg) scale(1.03) !important; }
        .ml-polaroid {
          background: linear-gradient(180deg, #f7eedd 0%, #ecdfc8 100%);
          padding: 7px 7px 22px;
          box-shadow:
            0 1px 1px rgba(0, 0, 0, 0.45),
            0 10px 22px rgba(0, 0, 0, 0.5),
            0 22px 48px rgba(0, 0, 0, 0.35);
        }
        .ml-img {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #0c0804;
          overflow: hidden;
        }
        .ml-caption {
          margin: 6px 3px 0;
          color: #5b4a37;
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 14px;
          text-align: center;
          line-height: 1.15;
          min-height: 16px;
          cursor: text;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ml-caption.ml-caption-empty {
          color: rgba(91, 74, 55, 0.32);
          font-style: italic;
        }
        .ml-caption-input {
          margin: 4px 3px 0;
          width: calc(100% - 6px);
          background: rgba(255, 255, 255, 0.7);
          border: none;
          border-bottom: 0.5px solid rgba(91, 74, 55, 0.4);
          outline: none;
          color: #3a2f24;
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 14px;
          line-height: 1.15;
          text-align: center;
          padding: 2px 4px;
          box-sizing: border-box;
        }
        @media (max-width: 640px) {
          .ml-timeline::before { left: 48px; }
          .ml-row { grid-template-columns: 40px 12px 1fr; gap: 8px; margin-bottom: 22px; }
          .ml-year { font-size: 15px; padding-top: 12px; }
          .ml-dot { margin-top: 17px; }
          .ml-row.ml-row-newyear .ml-dot { margin-top: 16px; }
          .ml-row.ml-row-newyear { margin-top: 26px; }
          .ml-polaroid-wrap { max-width: 190px; }
          .ml-caption { font-size: 13px; }
          .ml-caption-input { font-size: 13px; }
        }
      `}</style>

      <div className="ml-head">
        <SectionLabel>milestones</SectionLabel>
        <UploadButton
          defaultSection="amnie-achievement"
          ariaLabel="Add a milestone"
          className="ng-inline-add"
          style={{ marginBottom: "0.75rem" }}
        >
          <span className="ng-inline-plus" aria-hidden="true" />
        </UploadButton>
      </div>

      {sorted.length === 0 ? (
        <p className="ml-empty">no milestones yet · tap + to add the first</p>
      ) : (
        <div className="ml-timeline">
          {sorted.map((p, i) => {
            const year = p.uploadedAt ? new Date(p.uploadedAt).getFullYear() : "";
            const prevYear = i > 0 && sorted[i - 1].uploadedAt
              ? new Date(sorted[i - 1].uploadedAt).getFullYear()
              : null;
            const isNewYear = year && year !== prevYear;
            const tilt = ((i * 53) % 5) - 2; // -2 to +2 deg, subtle
            return (
              <div
                className={`ml-row ${isNewYear ? "ml-row-newyear" : ""}`}
                key={p.id || i}
              >
                <div className="ml-year">{isNewYear ? year : ""}</div>
                <div className="ml-dot" />
                <div>
                  <div
                    className="ml-polaroid-wrap"
                    style={{ transform: `rotate(${tilt}deg)` }}
                  >
                    <div className="ml-polaroid">
                      <div
                        className="ml-img"
                        style={{ aspectRatio: p.width && p.height ? `${p.width} / ${p.height}` : "4 / 3" }}
                      >
                        <Image
                          src={getPhotoUrl(p.url, "medium")}
                          alt={p.caption || ""}
                          fill
                          sizes="(max-width: 640px) 190px, 240px"
                          style={{ objectFit: "cover" }}
                          loading={i < 2 ? "eager" : "lazy"}
                        />
                      </div>
                      {editingCaption === p.url ? (
                        <input
                          className="ml-caption-input"
                          autoFocus
                          value={captionDraft}
                          maxLength={140}
                          placeholder="a caption…"
                          onChange={(e) => setCaptionDraft(e.target.value)}
                          onBlur={() => saveCaption(p)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")  { e.preventDefault(); saveCaption(p); }
                            if (e.key === "Escape") { setEditingCaption(null); }
                          }}
                        />
                      ) : (
                        (p.caption || isEditor) && (
                          <div
                            className={`ml-caption ${p.caption ? "" : "ml-caption-empty"}`}
                            onClick={() => { if (isEditor) startEdit(p); }}
                            title={isEditor ? "tap to edit" : ""}
                          >
                            {p.caption || "+ add a caption"}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── 3b. Polaroid Slides (manual swipeable slideshow) ─────────────────────────

function PolaroidSlides() {
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [editingCaption, setEditingCaption] = useState(null);
  const [captionDraft,   setCaptionDraft]   = useState("");
  const touchX = useRef(null);
  const { ensureEditor, isEditor } = useEditorGate();

  useEffect(() => {
    fetch("/api/photos?page=amnie&folder=album")
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {});
  }, []);

  const startEdit = (p) => {
    if (!ensureEditor()) return;
    setEditingCaption(p.url);
    setCaptionDraft(p.caption || "");
  };
  const saveCaption = async (p) => {
    const draft = (captionDraft || "").slice(0, 140);
    setEditingCaption(null);
    setPhotos(prev => prev.map(x => x.url === p.url ? { ...x, caption: draft } : x));
    try {
      await fetch("/api/photos/caption", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: p.url, caption: draft, page: "amnie", folder: "album" }),
      });
    } catch {/* keep optimistic */}
  };

  const go = (delta) => {
    setActive((a) => (a + delta + photos.length) % photos.length);
    setAnimKey((k) => k + 1);
  };

  const onKey = (e) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft")  go(-1);
  };

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 40) return;
    go(dx < 0 ? 1 : -1);
  };

  const cur  = photos[active];
  const prev = photos[(active - 1 + photos.length) % photos.length];
  const next = photos[(active + 1) % photos.length];

  return (
    <section style={{ padding: "0 1.25rem", overflow: "hidden" }}>
      <style>{`
        .ps-head {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 0.5rem;
        }
        .ps-empty {
          text-align: center;
          color: rgba(255, 220, 180, 0.35);
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 20px;
          padding: 50px 0;
        }
        .ps-stage {
          position: relative;
          width: 100%;
          max-width: 720px;
          height: 420px;
          margin: 1.5rem auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }
        .ps-peek {
          position: absolute;
          top: 50%;
          width: 140px;
          height: 175px;
          background: linear-gradient(180deg, #f7eedd 0%, #ecdfc8 100%);
          padding: 6px;
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.55);
          opacity: 0.32;
          cursor: pointer;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .ps-peek:hover { opacity: 0.72; }
        .ps-peek-left  { left: 0;   transform: translateY(-50%) rotate(-6deg); }
        .ps-peek-right { right: 0;  transform: translateY(-50%) rotate(6deg); }
        .ps-peek-img {
          position: relative;
          width: 100%;
          height: 100%;
          background: #0c0804;
          overflow: hidden;
        }
        .ps-active-wrap {
          position: relative;
          z-index: 2;
        }
        .ps-polaroid {
          background: linear-gradient(180deg, #f7eedd 0%, #ecdfc8 100%);
          padding: 12px 12px 34px;
          box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.5),
            0 22px 50px rgba(0, 0, 0, 0.6),
            0 50px 100px rgba(0, 0, 0, 0.4);
          width: 280px;
          animation: ps-enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes ps-enter {
          from { opacity: 0; transform: rotate(0deg) translateY(8px) scale(0.94); }
          to   { opacity: 1; transform: rotate(-1.5deg) translateY(0) scale(1); }
        }
        .ps-active-img {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          background: #0c0804;
          overflow: hidden;
        }
        .ps-caption {
          margin: 10px 4px 0;
          color: #5b4a37;
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 17px;
          text-align: center;
          line-height: 1.2;
          min-height: 20px;
          cursor: text;
        }
        .ps-caption.ps-caption-empty {
          color: rgba(91, 74, 55, 0.34);
          font-style: italic;
        }
        .ps-caption-input {
          margin: 8px 4px 0;
          width: calc(100% - 8px);
          background: rgba(255, 255, 255, 0.7);
          border: none;
          border-bottom: 0.5px solid rgba(91, 74, 55, 0.45);
          outline: none;
          color: #3a2f24;
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 17px;
          line-height: 1.2;
          text-align: center;
          padding: 2px 4px;
          box-sizing: border-box;
        }
        .ps-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }
        .ps-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255, 220, 180, 0.22);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.25s, transform 0.25s;
          min-width: 6px; min-height: 6px;
        }
        .ps-dot:hover { background: rgba(255, 220, 180, 0.5); }
        .ps-dot-active {
          background: rgba(255, 220, 180, 0.9);
          transform: scale(1.4);
        }
        .ps-hint {
          margin: 12px 0 0;
          text-align: center;
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255, 220, 180, 0.22);
        }
        @media (max-width: 640px) {
          .ps-stage { height: 380px; }
          .ps-peek { width: 80px; height: 110px; }
          .ps-polaroid { width: 230px; padding: 10px 10px 28px; }
          .ps-caption { font-size: 15px; }
        }
      `}</style>

      <div className="ps-head">
        <SectionLabel>album</SectionLabel>
        <UploadButton
          page="amnie"
          folder="album"
          destLabel="amnie's album"
          ariaLabel="Add to album"
          className="ng-inline-add"
          style={{ marginBottom: "0.75rem" }}
        >
          <span className="ng-inline-plus" aria-hidden="true" />
        </UploadButton>
      </div>

      {photos.length === 0 ? (
        <p className="ps-empty">album is empty · tap + to add</p>
      ) : (
        <>
          <div
            className="ps-stage"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onKeyDown={onKey}
            tabIndex={0}
          >
            {photos.length > 1 && prev && (
              <div className="ps-peek ps-peek-left" onClick={() => go(-1)}>
                <div className="ps-peek-img">
                  <Image
                    src={getPhotoUrl(prev.url, "thumb")}
                    alt=""
                    fill
                    sizes="140px"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {cur && (
              <div className="ps-active-wrap">
                <div className="ps-polaroid" key={animKey}>
                  <div
                    className="ps-active-img"
                    style={{ aspectRatio: cur.width && cur.height ? `${cur.width} / ${cur.height}` : "4 / 5" }}
                  >
                    <Image
                      src={getPhotoUrl(cur.url, "medium")}
                      alt={cur.caption || ""}
                      fill
                      sizes="(max-width: 640px) 230px, 280px"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                  </div>
                  {editingCaption === cur.url ? (
                    <input
                      className="ps-caption-input"
                      autoFocus
                      value={captionDraft}
                      maxLength={140}
                      placeholder="a caption…"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setCaptionDraft(e.target.value)}
                      onBlur={() => saveCaption(cur)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")  { e.preventDefault(); saveCaption(cur); }
                        if (e.key === "Escape") { setEditingCaption(null); }
                      }}
                    />
                  ) : (
                    (cur.caption || isEditor) && (
                      <div
                        className={`ps-caption ${cur.caption ? "" : "ps-caption-empty"}`}
                        onClick={(e) => { e.stopPropagation(); if (isEditor) startEdit(cur); }}
                        title={isEditor ? "tap to edit" : ""}
                      >
                        {cur.caption || "+ add a caption"}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {photos.length > 1 && next && next !== cur && (
              <div className="ps-peek ps-peek-right" onClick={() => go(1)}>
                <div className="ps-peek-img">
                  <Image
                    src={getPhotoUrl(next.url, "thumb")}
                    alt=""
                    fill
                    sizes="140px"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <>
              <div className="ps-dots">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    className={`ps-dot ${i === active ? "ps-dot-active" : ""}`}
                    onClick={() => { setActive(i); setAnimKey((k) => k + 1); }}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
              <p className="ps-hint">swipe or tap to flip</p>
            </>
          )}
        </>
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
          ariaLabel="Add a moment"
          className="ng-inline-add"
          style={{ marginBottom: "0.75rem" }}
        >
          <span className="ng-inline-plus" aria-hidden="true" />
        </UploadButton>
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
        <HeroSection
          fetchUrl="/api/amnie/hero"
          title="AMNIE"
          subtitle="my person · always & forever"
        />
        <DualCountdown />
        <MilestonesTimeline />
        <PolaroidSlides />
        <AmnScatter />
        <div style={{ height: "4rem" }} />
      </div>
      <AmnieMusicAmbient />
    </Providers>
  );
}
