"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Providers from "../providers";
import ScatterSection from "@/components/sections/ScatterSection";
import { getPhotoUrl } from "@/utils/photo";

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
      background: BG,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {photo && (
        <img
          src={getPhotoUrl(photo.url, "medium")}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "brightness(0.25) saturate(0.6)",
          }}
        />
      )}

      <div style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(to bottom, ${BG}44 0%, ${BG} 100%)`,
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
          width: `${Math.max(0, Math.min(100, progress))}%`,
          background: accent,
          borderRadius: "1px",
          transition: "width 1s linear",
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
    <section style={{ padding: "0 1.25rem 3.5rem", background: BG }}>
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
          title="until our day"
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

function AchievementModal({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: SURFACE,
          border: BORDER,
          borderRadius: "16px",
          overflow: "hidden",
          width: "min(92vw, 420px)",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.85rem",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.45)",
            fontSize: "22px",
            lineHeight: 1,
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          ×
        </button>

        <div style={{ position: "relative" }}>
          <img
            src={getPhotoUrl(item.imageUrl, "medium")}
            alt={item.title}
            style={{
              width: "100%",
              display: "block",
              objectFit: "cover",
            }}
          />
          <span style={{
            position: "absolute",
            top: "0.65rem",
            left: "0.65rem",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            color: "#f0d090",
            fontSize: "9px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "0.22rem 0.55rem",
            borderRadius: "3px",
          }}>
            {item.year}
          </span>
        </div>

        <div style={{ padding: "1.25rem 1.25rem 1.5rem" }}>
          <h2 style={{
            margin: "0 0 0.6rem",
            color: "#fff",
            fontWeight: 400,
            fontSize: "1.05rem",
            letterSpacing: "0.03em",
          }}>
            {item.title}
          </h2>
          <p style={{
            margin: 0,
            color: "rgba(255,255,255,0.55)",
            fontSize: "0.875rem",
            lineHeight: 1.65,
          }}>
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function AchievementsGrid() {
  const [achievements, setAchievements] = useState([]);
  const [selected, setSelected] = useState(null);
  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => setAchievements(d.achievements || []))
      .catch(() => {});
  }, []);

  if (achievements.length === 0) return null;

  return (
    <section style={{ background: BG, padding: "0 1.25rem 0" }}>
      <SectionLabel>milestones</SectionLabel>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "0.65rem",
        maxWidth: "680px",
        margin: "0 auto",
      }}>
        {achievements.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            style={{
              background: SURFACE,
              border: BORDER,
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={getPhotoUrl(item.imageUrl, "thumb")}
                alt={item.title}
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                  display: "block",
                  filter: "brightness(0.8)",
                  transition: "filter 0.3s ease",
                }}
              />
              <span style={{
                position: "absolute",
                top: "0.45rem",
                left: "0.45rem",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                color: "#f0d090",
                fontSize: "9px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "0.18rem 0.45rem",
                borderRadius: "3px",
              }}>
                {item.year}
              </span>
            </div>
            <div style={{ padding: "0.65rem 0.7rem 0.75rem" }}>
              <p style={{
                margin: "0 0 0.2rem",
                color: "rgba(255,255,255,0.88)",
                fontSize: "0.76rem",
                fontWeight: 500,
                lineHeight: 1.3,
              }}>
                {item.title}
              </p>
              <p style={{
                margin: 0,
                color: "rgba(255,255,255,0.34)",
                fontSize: "0.68rem",
                lineHeight: 1.45,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selected && <AchievementModal item={selected} onClose={close} />}
    </section>
  );
}

// ── 4. Scatter ───────────────────────────────────────────────────────────────

function AmnScatter() {
  return (
    <section style={{ background: BG, overflow: "hidden" }}>
      <SectionLabel>moments</SectionLabel>
      <ScatterSection page="amnie" />
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AmniePage() {
  return (
    <Providers>
      <div style={{ background: BG, minHeight: "100vh" }}>
        <AmnHero />
        <DualCountdown />
        <AchievementsGrid />
        <AmnScatter />
        <div style={{ height: "4rem" }} />
      </div>
    </Providers>
  );
}
