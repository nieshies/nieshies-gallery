"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Providers from "../providers";
import { getPhotoUrl } from "@/utils/photo";
import { UploadButton } from "@/components/features/UploadLightbox";

// ── constants ─────────────────────────────────────────────────────────────────

const BG      = "#0a0805";
const ACCENT  = "#c8854a";
const TEXT    = "#d0b090";
const SURFACE = "#160d09";
const BORDER  = "rgba(200,133,74,0.12)";

const LABEL_STYLE = {
  display: "block",
  textAlign: "center",
  fontSize: "9px",
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "rgba(200,133,74,0.55)",
  paddingTop: "3.5rem",
  paddingBottom: "0.75rem",
  userSelect: "none",
};

const MEMBERS = [
  { displayName: "ayah",      role: "father",  bio: "the backbone of everything.",     folder: "ayah"     },
  { displayName: "mummy",     role: "mother",  bio: "home is wherever she is.",        folder: "mummy"    },
  { displayName: "sabriena",  role: "sister",  bio: "the one who led the way.",        folder: "sabriena" },
  { displayName: "wanman",    role: "family",  bio: "always there no matter what.",    folder: "wanman"   },
  { displayName: "nishi",     role: "family",  bio: "chaos in the best way.",          folder: "nishi"    },
  { displayName: "ain qissy", role: "family",  bio: "the one who feeds everyone.",     folder: "ain"      },
];

const PI2 = Math.PI * 2;

const SCATTER_POS = [
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

const SCATTER_ANIM = [
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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchPhotos(url) {
  try {
    const r = await fetch(url);
    const d = await r.json();
    return d.photos || [];
  } catch { return []; }
}

// ── 1. Hero ───────────────────────────────────────────────────────────────────

function FamHero() {
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    fetch("/api/headers")
      .then(r => r.json())
      .then(d => {
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
      minHeight: "320px",
      overflow: "hidden",
      background: BG,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {photo && (
        <Image
          src={getPhotoUrl(photo.url, "medium")}
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center center", filter: "brightness(0.25)" }}
          sizes="100vw"
          priority
        />
      )}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, transparent 40%, #0a0805 100%)",
      }} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 1rem" }}>
        <h1 style={{
          margin: 0,
          color: "#fff",
          fontWeight: 300,
          fontSize: "clamp(28px, 5vw, 56px)",
          letterSpacing: "0.24em",
        }}>
          FAMILY
        </h1>
        <p style={{
          margin: "0.6rem 0 0",
          color: "rgba(255,255,255,0.22)",
          fontSize: "10px",
          letterSpacing: "0.34em",
          textTransform: "uppercase",
        }}>
          always &amp; forever
        </p>
      </div>
    </section>
  );
}

// ── 2. Strip ──────────────────────────────────────────────────────────────────

function FamStrip({ photos }) {
  if (photos.length === 0) return null;
  const doubled = [...photos, ...photos];

  return (
    <>
      <style>{`
        @keyframes famScroll {
          from { transform: translateX(0) translateZ(0); }
          to   { transform: translateX(-50%) translateZ(0); }
        }
        .fam-strip-track {
          animation: famScroll 22s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        .fam-strip-track:hover { animation-play-state: paused; }
        .fam-strip-item {
          position: relative;
          width: 190px;
          height: 140px;
          flex-shrink: 0;
          border-radius: 10px;
          overflow: hidden;
          transition: transform 0.3s ease;
          cursor: default;
        }
        .fam-strip-item:hover { transform: scale(1.04); }
        .fam-strip-img { transition: filter 0.3s ease; }
        .fam-strip-item:hover .fam-strip-img { filter: brightness(1) !important; }
      `}</style>
      <div style={{ overflow: "hidden", width: "100%" }}>
        <div className="fam-strip-track" style={{ display: "flex", gap: "6px", width: "max-content" }}>
          {doubled.map((photo, i) => (
            <div key={`${photo.id}-${i}`} className="fam-strip-item">
              <Image
                src={getPhotoUrl(photo.url, "thumb")}
                alt=""
                fill
                className="fam-strip-img"
                style={{ objectFit: "cover", filter: "brightness(0.82)" }}
                sizes="190px"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── 3. Member cards ───────────────────────────────────────────────────────────

function MemberModal({ member, photos, onClose }) {
  const hero = photos[0];

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.92)",
        zIndex: 200,
        overflowY: "auto",
        padding: "2rem 1rem 4rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: SURFACE,
          borderRadius: "18px",
          overflow: "hidden",
          border: `1px solid ${BORDER}`,
          marginTop: "2rem",
        }}
      >
        {hero ? (
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
            <Image
              src={getPhotoUrl(hero.url, "medium")}
              alt=""
              fill
              style={{ objectFit: "cover", filter: "brightness(0.85)" }}
              sizes="480px"
              priority
            />
          </div>
        ) : (
          <div style={{ width: "100%", aspectRatio: "16/9", background: "rgba(200,133,74,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ margin: 0, color: "rgba(200,133,74,0.3)", fontSize: "11px", letterSpacing: "0.2em" }}>no photos yet</p>
          </div>
        )}

        <div style={{ padding: "1.2rem 1.4rem 0.9rem" }}>
          <p style={{ margin: 0, color: "#fff", fontSize: "1.15rem", fontWeight: 600, letterSpacing: "0.02em", textTransform: "capitalize" }}>
            {member.displayName}
          </p>
          <p style={{ margin: "0.2rem 0 0.4rem", color: ACCENT, fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {member.role}
          </p>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.38)", fontSize: "0.78rem", fontStyle: "italic", lineHeight: 1.5 }}>
            {member.bio}
          </p>
        </div>

        {photos.length > 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px", padding: "0 0.8rem 0.8rem" }}>
            {photos.map((p, i) => (
              <div key={p.id} style={{ position: "relative", height: "60px", borderRadius: "5px", overflow: "hidden" }}>
                <Image
                  src={getPhotoUrl(p.url, "thumb")}
                  alt=""
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="120px"
                  loading={i < 3 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        style={{
          position: "fixed", top: "1rem", right: "1.25rem",
          background: "none", border: "none",
          color: "rgba(255,255,255,0.55)", fontSize: "28px",
          cursor: "pointer", zIndex: 201, lineHeight: 1,
        }}
      >×</button>
    </div>
  );
}

function FamMemberCards() {
  // Load member cover photos progressively — each updates state independently
  const [memberPhotos, setMemberPhotos] = useState({});
  const [modal, setModal] = useState(null);

  useEffect(() => {
    MEMBERS.forEach(m => {
      fetchPhotos(`/api/family/member?folder=${m.folder}`).then(photos => {
        if (photos.length) {
          setMemberPhotos(prev => ({ ...prev, [m.folder]: photos }));
        }
      });
    });
  }, []);

  const openModal = member => {
    const photos = memberPhotos[member.folder] || [];
    setModal({ member, photos });
  };

  return (
    <>
      <style>{`
        .fam-card {
          cursor: pointer;
          transition: transform 0.25s ease;
          background: ${SURFACE};
          border: 1px solid ${BORDER};
          border-radius: 12px;
          overflow: hidden;
        }
        .fam-card:hover { transform: scale(1.02); }
        .fam-card-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.52);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.25s ease;
        }
        .fam-card:hover .fam-card-overlay { opacity: 1; }
        .fam-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          max-width: 900px;
          margin: 0 auto;
        }
        @media (max-width: 639px) { .fam-cards-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <section style={{ background: BG, padding: "0 1.25rem" }}>
        <span style={LABEL_STYLE}>the team</span>
        <div className="fam-cards-grid">
          {MEMBERS.map(member => {
            const photos = memberPhotos[member.folder] || [];
            const cover  = photos[0];
            return (
              <div key={member.folder} className="fam-card" onClick={() => openModal(member)}>
                <div style={{ position: "relative", width: "100%", height: "160px" }}>
                  {cover ? (
                    <Image
                      src={getPhotoUrl(cover.url, "thumb")}
                      alt=""
                      fill
                      style={{ objectFit: "cover", filter: "brightness(0.7)" }}
                      sizes="240px"
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "rgba(200,133,74,0.05)" }} />
                  )}
                  <div className="fam-card-overlay">
                    <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                      view photos
                    </span>
                  </div>
                </div>
                <div style={{ padding: "0.55rem 0.7rem 0.65rem" }}>
                  <p style={{ margin: 0, color: TEXT, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.03em", textTransform: "capitalize" }}>
                    {member.displayName}
                  </p>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.3)", fontSize: "0.64rem", fontStyle: "italic", lineHeight: 1.4 }}>
                    {member.bio}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {modal && (
        <MemberModal
          member={modal.member}
          photos={modal.photos}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

// ── 4. Quote ──────────────────────────────────────────────────────────────────

function FamQuote() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section style={{ padding: "32px 1.5rem" }}>
      <p
        ref={ref}
        style={{
          margin: 0,
          textAlign: "center",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: "clamp(16px, 3vw, 26px)",
          color: "rgba(255,255,255,0.16)",
          letterSpacing: "0.04em",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        "the ones who were there before anyone else."
      </p>
    </section>
  );
}

// ── 5. Scatter ────────────────────────────────────────────────────────────────

function FamScatter({ photos }) {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const imgRefs = useRef([]);
  const rafRef  = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;
    const count  = isMobile ? Math.min(8, photos.length) : Math.min(12, photos.length);
    const mA     = 3;
    const rotAmp = isMobile ? 0.4 : 0.8;

    const loop = ts => {
      for (let i = 0; i < count; i++) {
        const el = imgRefs.current[i];
        if (!el) continue;
        const { period, phase, amp } = SCATTER_ANIM[i];
        const ω   = PI2 / period;
        const a   = isMobile ? mA : amp;
        const rot = SCATTER_POS[i].rotate + rotAmp * Math.sin(ω * ts * 1.31 + phase);
        el.style.transform = `translate(${a * Math.sin(ω * ts + phase)}px, ${a * Math.cos(ω * ts * 0.73 + phase)}px) rotate(${rot}deg)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [photos, isMobile]);

  if (photos.length === 0) return null;

  const count = isMobile ? Math.min(8, photos.length) : Math.min(12, photos.length);
  const imgW  = isMobile ? 130 : 200;
  const imgH  = Math.round(imgW * 16 / 9);

  return (
    <>
      <style>{`
        .fam-sc-wrap { transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .fam-sc-wrap:hover { transform: scale(1.1) !important; }
      `}</style>
      <div style={{ position: "relative", width: "100%", height: `${isMobile ? 900 : 1100}px`, overflow: "hidden" }}>
        {photos.slice(0, count).map((photo, i) => {
          const { top, left, rotate } = SCATTER_POS[i];
          return (
            <div
              key={photo.id}
              className="fam-sc-wrap"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(-1)}
              style={{ position: "absolute", top: `${top}%`, left: `${left}%`, zIndex: hoveredIdx === i ? 20 : 5 + i }}
            >
              <div
                ref={el => { imgRefs.current[i] = el; }}
                style={{
                  position: "relative", width: `${imgW}px`, height: `${imgH}px`,
                  borderRadius: "12px", overflow: "hidden",
                  willChange: "transform", transform: `rotate(${rotate}deg)`,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
                }}
              >
                <Image
                  src={getPhotoUrl(photo.url, "thumb")}
                  alt="" fill
                  style={{ objectFit: "cover" }}
                  sizes={`${imgW}px`}
                  draggable={false} loading="lazy"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── 6. Masonry ────────────────────────────────────────────────────────────────

function MasonryItem({ photo, index, onClick }) {
  const revealRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const delay = `${(index % 5) * 55}ms`;
  const ratio = photo.width && photo.height ? `${photo.width}/${photo.height}` : "4/3";

  return (
    <div style={{ breakInside: "avoid", marginBottom: "4px" }}>
      <div
        ref={revealRef}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          filter: visible ? "none" : "blur(4px)",
          transition: `opacity 0.55s ease ${delay}, transform 0.55s ease ${delay}, filter 0.55s ease ${delay}`,
        }}
      >
        <div
          className="fam-masonry-photo"
          onClick={() => onClick(index)}
          style={{ position: "relative", width: "100%", aspectRatio: ratio, overflow: "hidden", borderRadius: "8px", cursor: "pointer" }}
        >
          <Image
            src={getPhotoUrl(photo.url, "thumb")}
            alt="" fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
            loading="lazy" draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

function FamMasonry({ photos }) {
  const [lightbox, setLightbox] = useState({ open: false, idx: 0 });

  useEffect(() => {
    if (!lightbox.open) return;
    const onKey = e => {
      if (e.key === "Escape")     setLightbox(p => ({ ...p, open: false }));
      if (e.key === "ArrowRight") setLightbox(p => ({ ...p, idx: Math.min(p.idx + 1, photos.length - 1) }));
      if (e.key === "ArrowLeft")  setLightbox(p => ({ ...p, idx: Math.max(p.idx - 1, 0) }));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox.open, photos.length]);

  if (photos.length === 0) return null;
  const current = photos[lightbox.idx];

  return (
    <>
      <style>{`
        .fam-masonry { column-count: 4; column-gap: 4px; }
        @media (max-width: 639px)  { .fam-masonry { column-count: 2; } }
        @media (min-width: 640px) and (max-width: 1023px) { .fam-masonry { column-count: 3; } }
        .fam-masonry-photo { transition: transform 0.3s ease; }
        .fam-masonry-photo:hover  { transform: scale(1.03); }
      `}</style>

      <div className="fam-masonry">
        {photos.map((photo, i) => (
          <MasonryItem key={photo.id} photo={photo} index={i} onClick={idx => setLightbox({ open: true, idx })} />
        ))}
      </div>

      {lightbox.open && (
        <div
          onClick={() => setLightbox(p => ({ ...p, open: false }))}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.94)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: "relative", width: "min(92vw, 700px)", aspectRatio: current.width && current.height ? `${current.width}/${current.height}` : "4/3", borderRadius: "12px", overflow: "hidden" }}
          >
            <Image src={getPhotoUrl(current.url, "full")} alt="" fill style={{ objectFit: "cover" }} sizes="min(92vw, 700px)" priority />
          </div>
          <button onClick={() => setLightbox(p => ({ ...p, open: false }))} style={{ position: "absolute", top: "1rem", right: "1.25rem", background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: "28px", cursor: "pointer" }}>×</button>
          {lightbox.idx > 0 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(p => ({ ...p, idx: p.idx - 1 })); }} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>&#8592;</button>
          )}
          {lightbox.idx < photos.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(p => ({ ...p, idx: p.idx + 1 })); }} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>&#8594;</button>
          )}
        </div>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FamilyPage() {
  const [photos, setPhotos]     = useState([]);
  const [stripPhotos, setStrip] = useState([]);

  // Strip comes from the dedicated family/strip folder
  useEffect(() => {
    fetchPhotos("/api/family/strip").then(ps => setStrip(shuffle(ps)));
  }, []);

  // Scatter + masonry come from the family/photos folder
  useEffect(() => {
    fetchPhotos("/api/family/photos").then(ps => setPhotos(shuffle(ps)));
  }, []);

  const n       = photos.length;
  const scatter = photos.slice(0, Math.min(12, n));
  const masonry = photos;

  return (
    <Providers>
      <div style={{ background: BG, minHeight: "100vh" }}>

        <FamHero />

        <div style={{ overflow: "hidden", minHeight: "144px" }}>
          <span style={LABEL_STYLE}>moments</span>
          <FamStrip photos={stripPhotos} />
        </div>

        <FamMemberCards />

        <FamQuote />

        {scatter.length > 0 && (
          <div>
            <span style={LABEL_STYLE}>scattered</span>
            <FamScatter photos={scatter} />
          </div>
        )}

        {masonry.length > 0 && (
          <div style={{ padding: "0 0.75rem 4rem" }}>
            <span style={LABEL_STYLE}>memories</span>
            <FamMasonry photos={masonry} />
          </div>
        )}

        <UploadButton
          defaultSection="family"
          label="+"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 50,
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "1px solid rgba(200,133,74,0.4)",
            background: "rgba(0,0,0,0.7)",
            color: "rgba(200,133,74,0.85)",
            fontSize: "22px",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            lineHeight: 1,
          }}
        />

      </div>
    </Providers>
  );
}
