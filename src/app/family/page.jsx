"use client";
import { useEffect, useRef, useState } from "react"; // useRef kept for scatter RAF
import Image from "next/image";
import Providers from "../providers";
import HeroSection from "@/components/sections/HeroSection";
import { getPhotoUrl } from "@/utils/photo";
import { UploadButton } from "@/components/features/UploadLightbox";
import { useEditorGate } from "@/lib/EditorGate";

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
  color: "transparent",
  paddingTop: "3.5rem",
  paddingBottom: "0.75rem",
  userSelect: "none",
  pointerEvents: "none",
};

const MEMBERS = [
  { displayName: "ayah",      role: "father",  bio: "the backbone of everything.",     folder: "ayah"     },
  { displayName: "mummy",     role: "mother",  bio: "home is wherever she is.",        folder: "mummy"    },
  { displayName: "sabriena",  role: "sister",  bio: "the one who led the way.",        folder: "sabriena" },
  { displayName: "wanman",    role: "family",  bio: "always there no matter what.",    folder: "wanman"   },
  { displayName: "nishi",     role: "family",  bio: "chaos in the best way.",          folder: "nishi"    },
  { displayName: "ain qissy", role: "family",  bio: "the one who feeds everyone.",     folder: "ain"      },
];

// yt ambient per member — folder key matches MEMBERS[].folder
const MEMBER_SONGS = {
  ain:      { videoId: "B402rKl4bUg", start: 190, loopAt: 258 }, // 3:10 → 4:18
  sabriena: { videoId: "h-Y97xErGL8", start:  50, loopAt: 118 }, // 0:50 → 1:58
};

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

// scatter coordinates — deterministic per-index position for burst layout
// Deterministic per-index scatter coordinates. Photos are intentionally
// SMALL with HEAVY overlap and dramatic tilt — like a pile of dropped
// polaroids. Smaller on every device than the previous tuning so more
// fit on one screen without scrolling, matching the scattered-collage
// reference. Sizing scales to viewport.
function scatterPos(i, isMobile, canvasW) {
  const h1 = ((i * 9301  +  7) % 233) / 233;
  const h2 = ((i * 49297 + 13) % 233) / 233;
  const h3 = ((i * 7919  +  5) % 233) / 233;
  const h4 = ((i * 12553 + 11) % 233) / 233;

  if (isMobile) {
    // Mobile: ~32% viewport — small enough that 3-4 polaroids fit per
    // visual band without forcing a long scroll.
    const base  = Math.max(110, Math.min(160, canvasW * 0.32));
    const range = Math.max(24,  Math.min(40,  canvasW * 0.08));
    const width = base + h3 * range;

    // Alternate left/right bias for balance, with cross-centre drift
    const sideBias = (i % 2 === 0) ? 30 : 70;
    const leftPct  = Math.max(16, Math.min(84, sideBias + (h1 - 0.5) * 42));

    // Tight vertical packing — each photo sits at half its width below
    // the previous, so neighbours overlap by ~40-50%.
    const rowH  = width * 0.48 + 18;
    const topPx = 50 + i * rowH + (h2 - 0.5) * 60;

    return {
      leftPct,
      topPx,
      width,
      tilt: (h1 - 0.5) * 30, // ±15° — dramatic drift
    };
  }

  // Tablet — 3 photos per band, smaller widths with tight overlap
  if (canvasW < 960) {
    const width = 160 + h3 * 60; // 160-220
    const col3  = i % 3;
    const baseX = col3 === 0 ? 22 : col3 === 1 ? 50 : 78;
    const leftPct = Math.max(14, Math.min(86, baseX + (h1 - 0.5) * 28));
    const rowH = width * 0.55 + 18;
    return {
      leftPct,
      topPx: 50 + Math.floor(i / 3) * rowH + (h4 - 0.5) * 90,
      width,
      tilt:  (h1 - 0.5) * 30, // ±15°
    };
  }

  // Desktop — 4 photos per band, ~180-260px (smaller than before so
  // more fit on screen with heavy overlap, matching the scatter ref).
  const width = 180 + h3 * 80; // 180-260
  const col4  = i % 4;
  const baseX = col4 === 0 ? 18 : col4 === 1 ? 40 : col4 === 2 ? 62 : 84;
  const leftPct = Math.max(10, Math.min(90, baseX + (h1 - 0.5) * 26));
  const rowH = width * 0.5 + 20;
  return {
    leftPct,
    topPx: 50 + Math.floor(i / 4) * rowH + (h4 - 0.5) * 110,
    width,
    tilt:  (h1 - 0.5) * 32, // ±16°
  };
}

function MemberModal({ member, photos: initialPhotos, originRect, onClose, onBioSaved }) {
  const song = MEMBER_SONGS[member.folder];
  const { ensureEditor, isEditor } = useEditorGate();

  // photos managed locally so per-member uploads can refresh in place
  const [photos, setPhotos] = useState(initialPhotos || []);
  useEffect(() => setPhotos(initialPhotos || []), [initialPhotos]);

  const reloadPhotos = () => {
    fetch(`/api/family/member?folder=${member.folder}`)
      .then(r => r.json())
      .then(d => setPhotos(d.photos || []))
      .catch(() => {});
  };

  // viewport
  const [isMobile, setIsMobile] = useState(false);
  const [canvasW, setCanvasW]   = useState(1200);
  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 720);
      setCanvasW(window.innerWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // close with exit animation
  const [closing, setClosing] = useState(false);
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 320);
  };

  // photo zoom (click a scattered photo)
  const [zoomed, setZoomed] = useState(null);

  // per-photo mutation state (pin/delete/caption)
  const [confirmingDelete, setConfirmingDelete] = useState(null); // photo url
  const [editingCaption,   setEditingCaption]   = useState(null); // photo url
  const [captionDraft,     setCaptionDraft]     = useState("");
  const [busy,             setBusy]             = useState(null); // photo url
  // Brings a tapped polaroid to the front + un-tilts it so the caption /
  // action buttons aren't hidden under overlapping photos. Second tap zooms.
  const [focusedPhoto,     setFocusedPhoto]     = useState(null); // photo url

  const startCaptionEdit = (photo) => {
    if (!ensureEditor()) return;
    setEditingCaption(photo.url);
    setCaptionDraft(photo.caption || "");
  };

  const saveCaption = async (photo) => {
    const draft = (captionDraft || "").slice(0, 140);
    setEditingCaption(null);
    // Optimistic
    setPhotos(prev => prev.map(p => p.url === photo.url ? { ...p, caption: draft } : p));
    try {
      const r = await fetch("/api/family/member/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: photo.url, caption: draft }),
      });
      if (!r.ok) throw new Error("caption save failed");
    } catch {
      reloadPhotos();
    }
  };

  const togglePin = async (photo) => {
    if (!ensureEditor()) return;
    if (busy === photo.url) return;
    setBusy(photo.url);
    const willPin = !photo.isCover;
    // Optimistic: update local — exactly one photo can hold isCover
    setPhotos(prev => prev.map(p => ({
      ...p,
      isCover: p.url === photo.url ? willPin : false,
    })));
    try {
      if (willPin) {
        const r = await fetch("/api/family/member-cover", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: member.folder, photoUrl: photo.url }),
        });
        if (!r.ok) throw new Error("pin failed");
      } else {
        const r = await fetch(`/api/family/member-cover?folder=${member.folder}`, { method: "DELETE" });
        if (!r.ok) throw new Error("unpin failed");
      }
    } catch (err) {
      // Revert by re-fetching truth from server
      reloadPhotos();
    }
    setBusy(null);
  };

  const confirmDelete = async (photo) => {
    if (!ensureEditor()) return;
    if (busy === photo.url) return;
    setBusy(photo.url);
    setConfirmingDelete(null);
    // Optimistic: remove from local
    setPhotos(prev => prev.filter(p => p.url !== photo.url));
    try {
      const r = await fetch("/api/family/member/photo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: photo.url }),
      });
      if (!r.ok) throw new Error("delete failed");
    } catch (err) {
      // Restore by refetching truth
      reloadPhotos();
    }
    setBusy(null);
  };

  // ── music refs ───────────────────────────────────────────────────────────
  const playerRef  = useRef(null);
  const loopRef    = useRef(null);
  const mountedRef = useRef(true);
  const startedRef = useRef(false);
  const [audioState, setAudioState] = useState("idle");

  // ── keyboard + scroll lock + nav hide ─────────────────────────────────────
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") {
        if (zoomed)            setZoomed(null);
        else if (focusedPhoto) setFocusedPhoto(null);
        else                   close();
      }
    };
    document.body.style.overflow = "hidden";
    document.body.classList.add("fam-collage-open");
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.classList.remove("fam-collage-open");
    };
  }, [zoomed]);

  // ── youtube player (no autoplay — pill tap triggers start for iOS compat) ─
  useEffect(() => {
    if (!song) return;
    mountedRef.current = true;

    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;";
    document.body.appendChild(container);

    const initPlayer = () => {
      if (!mountedRef.current || playerRef.current) return;
      playerRef.current = new window.YT.Player(container, {
        width: 1, height: 1,
        videoId: song.videoId,
        playerVars: {
          autoplay: 0, controls: 0, disablekb: 1,
          fs: 0, rel: 0, start: song.start,
          loop: 0, playsinline: 1,
        },
        events: {
          onReady: () => {
            if (!mountedRef.current) return;
            loopRef.current = setInterval(() => {
              try {
                const t = playerRef.current?.getCurrentTime?.();
                if (t !== undefined && t >= song.loopAt) {
                  playerRef.current.seekTo(song.start, true);
                }
              } catch {}
            }, 500);
            // pill was tapped before player was ready — start now
            if (startedRef.current) {
              try { playerRef.current.setVolume(35); playerRef.current.playVideo(); } catch {}
            }
          },
        },
      });
    };

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevReady === "function") prevReady();
      initPlayer();
    };

    if (window.YT?.Player) {
      initPlayer();
    } else if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    return () => {
      mountedRef.current = false;
      if (loopRef.current) clearInterval(loopRef.current);
      try { playerRef.current?.stopVideo(); playerRef.current?.destroy(); } catch {}
      playerRef.current = null;
      container.remove();
    };
  }, [song]);

  // called directly from tap event → satisfies iOS gesture requirement
  const handlePill = e => {
    e.stopPropagation();
    if (audioState === "idle") {
      startedRef.current = true;
      try { playerRef.current?.setVolume(35); playerRef.current?.playVideo(); } catch {}
      setAudioState("playing");
    } else if (audioState === "playing") {
      try { playerRef.current?.mute(); } catch {}
      setAudioState("muted");
    } else {
      try { playerRef.current?.unMute(); } catch {}
      setAudioState("playing");
    }
  };

  const pillLabel  = audioState === "idle"    ? "♪ tap to play" :
                     audioState === "playing"  ? "♪ playing"     : "♪ muted";
  const pillColor  = audioState === "playing"  ? "#c8854a"       :
                     audioState === "muted"    ? "#5a4838"       : "rgba(200,133,74,0.5)";
  const pillBorder = audioState === "playing"  ? "rgba(200,133,74,0.3)" : "rgba(90,72,56,0.4)";

  // ── editable bio ──────────────────────────────────────────────────────────
  const [currentBio,  setCurrentBio]  = useState(member.bio);
  const [draftBio,    setDraftBio]    = useState(member.bio);
  const [editingBio,  setEditingBio]  = useState(false);
  const [savingBio,   setSavingBio]   = useState(false);

  useEffect(() => {
    fetch(`/api/family/member-bio?folder=${member.folder}`)
      .then(r => r.json())
      .then(d => { if (d.bio) { setCurrentBio(d.bio); setDraftBio(d.bio); } })
      .catch(() => {});
  }, [member.folder]);

  const saveBio = async e => {
    e.stopPropagation();
    if (!ensureEditor()) return;
    setSavingBio(true);
    try {
      const r = await fetch("/api/family/member-bio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: member.folder, bio: draftBio }),
      });
      const d = await r.json();
      setCurrentBio(d.bio);
      setEditingBio(false);
      onBioSaved?.(member.folder, d.bio);
    } catch {}
    setSavingBio(false);
  };

  // ── scatter layout ────────────────────────────────────────────────────────
  const layout = photos.map((_, i) => scatterPos(i, isMobile, canvasW));
  const winH = typeof window !== "undefined" ? window.innerHeight : 800;
  // Canvas height needs to fit the last row of scattered photos. Derive it
  // from the actual layout so changes to scatterPos don't desync the height.
  const lastRowBottom = layout.length
    ? Math.max(...layout.map(p => p.topPx + p.width * 1.3))
    : 0;
  const canvasH = Math.max(winH, lastRowBottom + 140);

  // burst origin (clicked card)
  const origin = (() => {
    if (originRect) {
      return {
        cx: originRect.left + originRect.width / 2,
        cy: originRect.top  + originRect.height / 2,
      };
    }
    if (typeof window !== "undefined") {
      return { cx: window.innerWidth / 2, cy: window.innerHeight / 2 };
    }
    return { cx: 0, cy: 0 };
  })();

  return (
    <div
      className={`mc-overlay ${closing ? "mc-closing" : ""}`}
      onClick={close}
    >
      <style>{`
        .mc-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background:
            radial-gradient(ellipse at 30% 10%, rgba(40, 60, 110, 0.32), transparent 55%),
            radial-gradient(ellipse at 80% 90%, rgba(60, 30, 80, 0.22),  transparent 55%),
            linear-gradient(180deg, #050813 0%, #02040a 100%);
          overflow-y: auto;
          overflow-x: hidden;
          animation: mc-fade-in 0.4s ease both;
          -webkit-overflow-scrolling: touch;
        }
        .mc-overlay.mc-closing { animation: mc-fade-out 0.32s ease both; }
        @keyframes mc-fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mc-fade-out { from { opacity: 1; } to { opacity: 0; } }

        /* ── header bar ────────────────────────────────────────────── */
        .mc-header {
          position: sticky;
          top: 0;
          z-index: 5;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: max(20px, env(safe-area-inset-top, 0)) 24px 12px;
          pointer-events: none;
        }
        .mc-header > * { pointer-events: auto; }
        .mc-header-left {
          max-width: 70%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        .mc-name {
          margin: 0;
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 38px;
          line-height: 1;
          color: rgba(255, 245, 230, 0.95);
          text-transform: capitalize;
        }
        .mc-role {
          margin: 6px 0 0;
          font-size: 9px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(255, 245, 230, 0.4);
        }
        .mc-header-right {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .mc-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 0.5px solid rgba(255, 245, 230, 0.22);
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: rgba(255, 245, 230, 0.55);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; line-height: 1;
          transition: color 0.2s, border-color 0.2s;
          touch-action: manipulation;
        }
        .mc-icon-btn:hover {
          color: rgba(255, 245, 230, 0.95);
          border-color: rgba(255, 245, 230, 0.5);
        }
        .mc-music-pill {
          background: rgba(0, 0, 0, 0.35);
          border: 0.5px solid rgba(244, 140, 54, 0.25);
          border-radius: 20px;
          padding: 7px 13px;
          color: rgba(244, 140, 54, 0.7);
          font-size: 10px;
          letter-spacing: 0.1em;
          cursor: pointer;
          font-family: inherit;
          min-height: 36px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: color 0.2s, border-color 0.2s;
        }
        .mc-music-pill:hover { color: #f08a3a; border-color: rgba(244, 140, 54, 0.55); }

        /* ── canvas ────────────────────────────────────────────────── */
        .mc-canvas {
          position: relative;
          width: 100%;
          margin: 0 auto;
          padding: 0 0 140px;
        }
        .mc-photo {
          position: absolute;
          transform-origin: center;
          cursor: pointer;
          /* CSS containment isolates each polaroid's repaint/layout work — */
          /* big galleries stay smooth because changes don't cascade. */
          contain: layout style paint;
          /* GPU layer via translate3d below; hint helps Safari composite cleanly. */
          will-change: transform;
          animation: mc-burst 0.85s cubic-bezier(0.22, 1.2, 0.36, 1) both;
          animation-delay: var(--mc-delay);
          padding: 8px 8px 22px;
          background: linear-gradient(180deg, #f7eedd 0%, #ecdfc8 100%);
          /* Simpler shadow — one ambient + one drop. Heavy multi-layer shadows */
          /* compound when 30+ polaroids are on screen and tank scroll perf. */
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.5),
            0 18px 36px rgba(0, 0, 0, 0.55);
          transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.28s ease;
        }
        /* Drop will-change after the entry animation finishes so we don't
           keep 30+ GPU layers alive forever. The burst is 0.85s + max stagger. */
        .mc-photo.mc-settled { will-change: auto; }
        .mc-photo:hover {
          transform: translate3d(-50%, -50%, 0) rotate(0deg) scale(1.05) !important;
          z-index: 50;
          box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.5),
            0 28px 60px rgba(0, 0, 0, 0.65);
        }
        /* Tap-to-focus: pops above neighbours so the caption + actions are reachable. */
        .mc-photo.is-focused {
          z-index: 100 !important;
          transform: translate3d(-50%, -50%, 0) rotate(0deg) scale(1.14) !important;
          will-change: transform;
          box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.55),
            0 32px 72px rgba(0, 0, 0, 0.72),
            0 0 0 0.5px rgba(244, 140, 54, 0.45);
        }
        .mc-photo.is-focused .mc-photo-actions { opacity: 1; pointer-events: auto; }
        @media (max-width: 720px) {
          .mc-photo.is-focused {
            transform: translate3d(-50%, -50%, 0) rotate(0deg) scale(1.18) !important;
          }
        }
        /* Honour reduced-motion preference — no burst, just a fade in. */
        @media (prefers-reduced-motion: reduce) {
          .mc-photo {
            animation: mc-fade-only 0.2s ease both;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          @keyframes mc-fade-only {
            from { opacity: 0; } to { opacity: 1; }
          }
        }
        @keyframes mc-burst {
          0% {
            transform: translate3d(calc(-50% + var(--mc-dx)), calc(-50% + var(--mc-dy)), 0)
                       rotate(0deg) scale(0.22);
            opacity: 0;
          }
          50% { opacity: 1; }
          100% {
            transform: translate3d(-50%, -50%, 0) rotate(var(--mc-rot)) scale(1);
            opacity: 1;
          }
        }
        .mc-photo-img {
          position: relative;
          display: block;
          width: 100%;
          overflow: hidden;
          background: #0a0805;
        }
        .mc-photo-img img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .mc-photo-caption {
          margin: 6px 2px 0;
          color: #5b4a37;
          font-size: 13px;
          font-family: "Caveat", "Bradley Hand", cursive;
          text-align: center;
          line-height: 1.1;
          min-height: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: text;
        }
        .mc-photo-caption.mc-caption-empty {
          color: rgba(91, 74, 55, 0.32);
          font-style: italic;
        }
        .mc-photo-caption-input {
          margin: 4px 2px 0;
          width: calc(100% - 4px);
          background: rgba(255, 255, 255, 0.7);
          border: none;
          border-bottom: 0.5px solid rgba(91, 74, 55, 0.4);
          outline: none;
          color: #3a2f24;
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 13px;
          line-height: 1.1;
          text-align: center;
          padding: 2px 4px;
          box-sizing: border-box;
        }

        /* ── per-photo actions (pin / delete) ───────────────────── */
        .mc-photo-actions {
          position: absolute;
          top: 14px; left: 14px; right: 14px;
          display: flex;
          justify-content: space-between;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
          z-index: 2;
        }
        .mc-photo:hover .mc-photo-actions { opacity: 1; pointer-events: auto; }
        @media (hover: none) {
          .mc-photo-actions { opacity: 0.85; pointer-events: auto; }
        }
        .mc-photo-action {
          width: 24px; height: 24px;
          border-radius: 50%;
          border: 0.5px solid rgba(255, 255, 255, 0.32);
          background: rgba(0, 0, 0, 0.55);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-size: 14px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 0;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: color 0.2s, border-color 0.2s, background 0.2s, transform 0.2s;
          touch-action: manipulation;
        }
        .mc-photo-action:hover {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.65);
          background: rgba(0, 0, 0, 0.7);
          transform: scale(1.08);
        }
        .mc-photo-action.mc-pinned {
          color: #f48c36;
          border-color: rgba(244, 140, 54, 0.6);
          background: rgba(244, 140, 54, 0.15);
        }
        .mc-photo-action.mc-photo-delete:hover {
          color: #ff8a8a;
          border-color: rgba(255, 100, 100, 0.6);
        }

        /* ── inline delete confirm ──────────────────────────────── */
        .mc-photo-confirm {
          position: absolute;
          inset: 8px 8px 22px;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: rgba(255, 245, 230, 0.92);
          z-index: 3;
          cursor: default;
        }
        .mc-photo-confirm span {
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 19px;
        }
        .mc-photo-confirm button {
          background: transparent;
          border: 0.5px solid rgba(255, 245, 230, 0.35);
          color: rgba(255, 245, 230, 0.8);
          padding: 7px 16px;
          border-radius: 3px;
          font-family: inherit;
          font-size: 9px;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          cursor: pointer;
          min-height: 30px;
          touch-action: manipulation;
        }
        .mc-photo-confirm button.mc-confirm-yes {
          color: #ff8a8a;
          border-color: rgba(255, 100, 100, 0.55);
        }
        .mc-photo-confirm button.mc-confirm-yes:hover {
          background: rgba(255, 100, 100, 0.1);
        }
        .mc-photo-confirm button.mc-confirm-no:hover {
          color: #fff;
          border-color: rgba(255, 245, 230, 0.6);
        }

        /* ── empty state ──────────────────────────────────────────── */
        .mc-empty {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: rgba(255, 245, 230, 0.45);
        }
        .mc-empty-title {
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 32px;
          margin: 0 0 6px;
          color: rgba(255, 245, 230, 0.7);
        }
        .mc-empty-sub {
          margin: 0;
          font-size: 10px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
        }

        /* ── bottom dock ──────────────────────────────────────────── */
        .mc-dock {
          position: fixed;
          left: 0; right: 0;
          bottom: 0;
          padding: 18px 22px max(18px, calc(env(safe-area-inset-bottom) + 14px));
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.85) 100%);
          z-index: 6;
          pointer-events: none;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
        }
        .mc-dock > * { pointer-events: auto; }
        .mc-bio {
          flex: 1;
          max-width: 540px;
          color: rgba(255, 245, 230, 0.55);
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 18px;
          line-height: 1.35;
          cursor: text;
          padding: 4px 0;
          border-bottom: 0.5px dashed rgba(255, 245, 230, 0.12);
          transition: color 0.2s, border-color 0.2s;
        }
        .mc-bio:hover { color: rgba(255, 245, 230, 0.85); border-color: rgba(255, 245, 230, 0.25); }
        .mc-bio-edit {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: rgba(255, 245, 230, 0.9);
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 18px;
          line-height: 1.35;
          resize: none;
          padding: 4px 0;
          border-bottom: 0.5px solid rgba(244, 140, 54, 0.5);
        }
        .mc-bio-actions {
          display: flex;
          gap: 8px;
          margin-top: 6px;
          font-size: 9px;
          letter-spacing: 0.36em;
          text-transform: uppercase;
        }
        .mc-bio-actions button {
          background: transparent;
          border: none;
          color: rgba(244, 140, 54, 0.7);
          font-family: inherit;
          font-size: 9px;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 6px 0;
          min-height: 30px;
        }
        .mc-bio-actions button.mc-cancel { color: rgba(255, 245, 230, 0.35); }
        .mc-bio-actions button:hover { color: rgba(244, 140, 54, 1); }

        .mc-count {
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255, 245, 230, 0.32);
        }
        .mc-add {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 0.5px solid rgba(255, 245, 230, 0.25);
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: border-color 0.3s, background 0.3s;
          touch-action: manipulation;
        }
        .mc-add:hover {
          border-color: rgba(244, 140, 54, 0.7);
          background: rgba(0, 0, 0, 0.6);
        }
        .mc-add-plus {
          position: relative;
          display: block;
          width: 16px; height: 16px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .mc-add:hover .mc-add-plus { opacity: 1; }
        .mc-add-plus::before, .mc-add-plus::after {
          content: "";
          position: absolute;
          background: rgba(255, 245, 230, 0.95);
        }
        .mc-add-plus::before { top: 50%; left: 0; right: 0; height: 0.5px; transform: translateY(-50%); }
        .mc-add-plus::after  { left: 50%; top: 0; bottom: 0; width: 0.5px;  transform: translateX(-50%); }
        .mc-add:hover .mc-add-plus::before,
        .mc-add:hover .mc-add-plus::after { background: rgba(244, 140, 54, 1); }

        /* ── zoom overlay ─────────────────────────────────────────── */
        .mc-zoom {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: mc-fade-in 0.25s ease both;
        }
        .mc-zoom-img {
          position: relative;
          max-width: 100%;
          max-height: 100%;
          width: min(1100px, 100%);
          height: min(80vh, 800px);
        }
        .mc-zoom-cap {
          position: absolute;
          bottom: -34px; left: 50%;
          transform: translateX(-50%);
          color: rgba(255, 245, 230, 0.75);
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 16px;
          text-align: center;
          white-space: nowrap;
        }

        @media (max-width: 720px) {
          .mc-name { font-size: 30px; }
          .mc-dock { flex-direction: column; align-items: stretch; gap: 12px; }
          .mc-dock-row {
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
          }
        }
      `}</style>

      <div className="mc-header" onClick={e => e.stopPropagation()}>
        <div className="mc-header-left">
          <div>
            <h2 className="mc-name">{member.displayName}</h2>
            <p className="mc-role">{member.role}</p>
          </div>
          {song && (
            <button className="mc-music-pill" onClick={handlePill}>
              {pillLabel}
            </button>
          )}
        </div>
        <div className="mc-header-right">
          <button
            className="mc-icon-btn"
            onClick={(e) => { e.stopPropagation(); close(); }}
            aria-label="Close"
          >×</button>
        </div>
      </div>

      <div
        className="mc-canvas"
        style={{ minHeight: canvasH }}
        onClick={e => {
          e.stopPropagation();
          // Tap on the empty canvas area unfocuses any currently-focused photo
          // (only fires here when the photo's own onClick didn't stop propagation).
          if (e.target === e.currentTarget && focusedPhoto) setFocusedPhoto(null);
        }}
      >
        {photos.length === 0 ? (
          <div className="mc-empty">
            <p className="mc-empty-title">no memories yet</p>
            <p className="mc-empty-sub">tap + to add one</p>
          </div>
        ) : (
          photos.map((p, i) => {
            const pos = layout[i];
            const finalLeftPx = (pos.leftPct / 100) * canvasW;
            const finalTopPx  = pos.topPx;
            const dx = origin.cx - finalLeftPx;
            const dy = origin.cy - finalTopPx;
            // Cap stagger so a 30-photo gallery still finishes bursting in
            // under 1.5s instead of ~2s. After index 12 every photo shares
            // the same delay so the tail doesn't drag.
            const staggerMs = Math.min(i, 12) * 55;
            const isFocused = focusedPhoto === p.url || editingCaption === p.url;
            return (
              <div
                key={p.id}
                className={`mc-photo ${isFocused ? "is-focused" : ""}`}
                onAnimationEnd={(e) => {
                  // Drop will-change after the burst — keeps the layer cache lean.
                  if (e.animationName === "mc-burst") {
                    e.currentTarget.classList.add("mc-settled");
                  }
                }}
                style={{
                  left: `${pos.leftPct}%`,
                  top:  `${pos.topPx}px`,
                  width: `${pos.width}px`,
                  zIndex: i + 1,
                  ["--mc-dx"]:    `${dx}px`,
                  ["--mc-dy"]:    `${dy}px`,
                  ["--mc-rot"]:   `${pos.tilt}deg`,
                  ["--mc-delay"]: `${staggerMs}ms`,
                  transform: `translate3d(-50%, -50%, 0) rotate(${pos.tilt}deg)`,
                }}
                onClick={() => {
                  if (confirmingDelete === p.url) return;
                  // First tap → bring to front so caption + actions are reachable.
                  // Second tap on an already-focused photo → open the fullscreen zoom.
                  if (focusedPhoto !== p.url) {
                    setFocusedPhoto(p.url);
                    return;
                  }
                  setZoomed(p);
                }}
              >
                <div
                  className="mc-photo-img"
                  style={{ aspectRatio: p.width && p.height ? `${p.width} / ${p.height}` : "4 / 5" }}
                >
                  <Image
                    src={getPhotoUrl(p.url, "medium")}
                    alt={p.caption || ""}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes={`${Math.round(pos.width)}px`}
                    loading={i < 4 ? "eager" : "lazy"}
                  />
                </div>
                {editingCaption === p.url ? (
                  <input
                    className="mc-photo-caption-input"
                    autoFocus
                    value={captionDraft}
                    maxLength={140}
                    placeholder="a caption…"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => setCaptionDraft(e.target.value)}
                    onBlur={() => saveCaption(p)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); saveCaption(p); }
                      if (e.key === "Escape") { e.preventDefault(); setEditingCaption(null); }
                    }}
                  />
                ) : (
                  // Always show captions to everyone. Only show the "+ add a
                  // caption" placeholder to editors (non-editors see nothing).
                  (p.caption || isEditor) && (
                    <div
                      className={`mc-photo-caption ${p.caption ? "" : "mc-caption-empty"}`}
                      onClick={(e) => { e.stopPropagation(); if (isEditor) startCaptionEdit(p); }}
                      title={isEditor ? "tap to edit caption" : ""}
                    >
                      {p.caption || "+ add a caption"}
                    </div>
                  )
                )}

                {confirmingDelete === p.url ? (
                  <div
                    className="mc-photo-confirm"
                    onClick={e => e.stopPropagation()}
                  >
                    <span>delete?</span>
                    <button
                      type="button"
                      className="mc-confirm-yes"
                      onClick={(e) => { e.stopPropagation(); confirmDelete(p); }}
                    >yes</button>
                    <button
                      type="button"
                      className="mc-confirm-no"
                      onClick={(e) => { e.stopPropagation(); setConfirmingDelete(null); }}
                    >no</button>
                  </div>
                ) : (
                  <div className="mc-photo-actions">
                    <button
                      type="button"
                      className={`mc-photo-action ${p.isCover ? "mc-pinned" : ""}`}
                      onClick={(e) => { e.stopPropagation(); togglePin(p); }}
                      aria-label={p.isCover ? "Unpin cover" : "Pin as cover"}
                      title={p.isCover ? "Unpin cover" : "Pin as cover"}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M12 2l2.5 6.5 6.5.5-5 4.5 1.5 7-5.5-4-5.5 4 1.5-7-5-4.5 6.5-.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="mc-photo-action mc-photo-delete"
                      onClick={(e) => { e.stopPropagation(); if (!ensureEditor()) return; setConfirmingDelete(p.url); }}
                      aria-label="Delete photo"
                      title="Delete photo"
                    >×</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mc-dock" onClick={e => e.stopPropagation()}>
        {editingBio ? (
          <div style={{ flex: 1, maxWidth: 540 }}>
            <textarea
              className="mc-bio-edit"
              rows={2}
              value={draftBio}
              autoFocus
              onChange={e => setDraftBio(e.target.value)}
            />
            <div className="mc-bio-actions">
              <button onClick={saveBio} disabled={savingBio}>
                {savingBio ? "saving…" : "save"}
              </button>
              <button
                type="button"
                className="mc-cancel"
                onClick={e => { e.stopPropagation(); setDraftBio(currentBio); setEditingBio(false); }}
              >cancel</button>
            </div>
          </div>
        ) : (
          <p
            className="mc-bio"
            onClick={e => { e.stopPropagation(); if (!ensureEditor()) return; setEditingBio(true); setDraftBio(currentBio); }}
            title="tap to edit"
          >
            {currentBio || "tap to add a note…"}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="mc-count">
            {photos.length === 0 ? "" : `${photos.length} photo${photos.length === 1 ? "" : "s"}`}
          </span>
          <UploadButton
            ariaLabel={`Add a photo to ${member.displayName}`}
            className="mc-add"
            page="family"
            folder={member.folder}
            destLabel={`${member.displayName}'s memories`}
            onUploaded={reloadPhotos}
          >
            <span className="mc-add-plus" aria-hidden="true" />
          </UploadButton>
        </div>
      </div>

      {zoomed && (
        <div className="mc-zoom" onClick={() => setZoomed(null)}>
          <div className="mc-zoom-img" onClick={e => e.stopPropagation()}>
            <Image
              src={getPhotoUrl(zoomed.url, "large")}
              alt={zoomed.caption || ""}
              fill
              style={{ objectFit: "contain" }}
              sizes="100vw"
              priority
            />
            {zoomed.caption && <div className="mc-zoom-cap">{zoomed.caption}</div>}
          </div>
          <button
            className="mc-icon-btn"
            onClick={(e) => { e.stopPropagation(); setZoomed(null); }}
            style={{ position: "fixed", top: "max(16px, env(safe-area-inset-top, 0))", right: "max(16px, env(safe-area-inset-right, 0))" }}
            aria-label="Close photo"
          >×</button>
        </div>
      )}
    </div>
  );
}

// ── 3a. Family Tree ──────────────────────────────────────────────────────────

const TREE_LAYOUT = {
  parents: [
    { folder: "ayah",  role: "father" },
    { folder: "mummy", role: "mother" },
  ],
  kids: [
    { folder: "sabriena", role: "1st sister"  },
    { folder: "nishi",    role: "2nd brother" },
    { folder: "wanman",   role: "3rd brother" },
    { folder: "ain",      role: "last sister" },
  ],
};

const TREE_LINE = "rgba(200,133,74,0.35)";

function FamilyTree({ memberPhotos, openModal }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const NODE = isMobile ? 54 : 78;
  const LABEL_AREA = 36;
  const CONNECTOR_H = isMobile ? 48 : 62;

  const findMember = folder => MEMBERS.find(m => m.folder === folder);

  const renderNode = ({ folder, role }) => {
    const member = findMember(folder);
    if (!member) return null;
    const photos = memberPhotos[folder] || [];
    const cover  = photos[0];
    return (
      <button
        key={folder}
        onClick={(e) => openModal(member, e)}
        className="tree-node"
        style={{ width: NODE, height: NODE }}
        aria-label={member.displayName}
      >
        <span className="tree-node-img">
          {cover ? (
            <Image
              src={getPhotoUrl(cover.url, "thumb")}
              alt=""
              fill
              sizes={`${NODE}px`}
              style={{ objectFit: "cover" }}
              loading="lazy"
            />
          ) : (
            <span className="tree-node-empty" />
          )}
        </span>
        <span className="tree-node-name" style={{ fontSize: isMobile ? "0.62rem" : "0.72rem" }}>
          {member.displayName}
        </span>
        <span className="tree-node-role" style={{ fontSize: isMobile ? "0.46rem" : "0.52rem" }}>
          {role}
        </span>
      </button>
    );
  };

  return (
    <section style={{ padding: isMobile ? "1.5rem 0.75rem 0.5rem" : "2rem 1.25rem 1rem", maxWidth: 720, margin: "0 auto" }}>
      <style>{`
        .tree-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          justify-items: center;
          align-items: start;
          row-gap: 0;
        }
        .tree-node {
          position: relative;
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          z-index: 2;
          touch-action: manipulation;
          transition: transform 0.25s ease;
        }
        .tree-node:hover  { transform: scale(1.08); }
        .tree-node:active { transform: scale(0.94); }
        .tree-node-img {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid ${TREE_LINE};
          background: rgba(200,133,74,0.05);
          filter: brightness(0.85);
          transition: border-color 0.25s ease, filter 0.25s ease;
        }
        .tree-node:hover .tree-node-img { border-color: ${ACCENT}; filter: brightness(1); }
        .tree-node-empty {
          display: block; width: 100%; height: 100%;
          background: rgba(200,133,74,0.08);
        }
        .tree-node-name {
          position: absolute; top: 100%; left: 50%;
          transform: translateX(-50%);
          padding-top: 6px;
          color: #fff;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: capitalize;
          white-space: nowrap;
        }
        .tree-node-role {
          position: absolute; top: 100%; left: 50%;
          transform: translateX(-50%);
          padding-top: 22px;
          color: ${TREE_LINE};
          letter-spacing: 0.18em;
          text-transform: uppercase;
          white-space: nowrap;
        }
      `}</style>

      {/* parents row — placed in columns 2 & 3 of a 4-col grid so the
          midpoint (50%) lines up with the kids' bar below */}
      <div className="tree-grid" style={{ height: NODE + LABEL_AREA }}>
        <div />
        {renderNode(TREE_LAYOUT.parents[0])}
        {renderNode(TREE_LAYOUT.parents[1])}
        <div />
      </div>

      {/* connector lines */}
      <div style={{ position: "relative", height: CONNECTOR_H }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {/* drop from parent midpoint to horizontal bar */}
          <line x1="50" y1="0" x2="50" y2="50"
                stroke={TREE_LINE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {/* horizontal bar across kids */}
          <line x1="12.5" y1="50" x2="87.5" y2="50"
                stroke={TREE_LINE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {/* drops to each kid (cols at 12.5/37.5/62.5/87.5) */}
          {[12.5, 37.5, 62.5, 87.5].map(x => (
            <line key={x} x1={x} y1="50" x2={x} y2="100"
                  stroke={TREE_LINE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>

      {/* kids row */}
      <div className="tree-grid" style={{ height: NODE + LABEL_AREA }}>
        {TREE_LAYOUT.kids.map(renderNode)}
      </div>
    </section>
  );
}

function FamMemberCards() {
  const [memberPhotos, setMemberPhotos] = useState({});
  const [memberBios,   setMemberBios]   = useState({});
  const [modal,        setModal]        = useState(null);
  const [editingCard,  setEditingCard]  = useState(null); // folder key
  const [cardDraft,    setCardDraft]    = useState("");
  const [savingCard,   setSavingCard]   = useState(false);
  const [cardError,    setCardError]    = useState("");
  const cardDraftRef = useRef("");
  const { ensureEditor } = useEditorGate();

  useEffect(() => {
    MEMBERS.forEach(m => {
      fetchPhotos(`/api/family/member?folder=${m.folder}`).then(photos => {
        if (photos.length) setMemberPhotos(prev => ({ ...prev, [m.folder]: photos }));
      });
      fetch(`/api/family/member-bio?folder=${m.folder}`)
        .then(r => r.json())
        .then(d => { setMemberBios(prev => ({ ...prev, [m.folder]: d.bio || "" })); })
        .catch(() => {});
    });
  }, []);

  const openModal = (member, e) => {
    const photos = memberPhotos[member.folder] || [];
    const rect = e?.currentTarget?.getBoundingClientRect?.();
    const originRect = rect
      ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      : null;
    setModal({ member, photos, originRect });
  };

  const handleBioSaved = (folder, bio) => {
    setMemberBios(prev => ({ ...prev, [folder]: bio }));
  };

  const startCardEdit = (e, folder) => {
    e.stopPropagation();
    if (!ensureEditor()) return;
    const initial = memberBios[folder] || MEMBERS.find(m => m.folder === folder)?.bio || "";
    cardDraftRef.current = initial;
    setCardDraft(initial);
    setCardError("");
    setEditingCard(folder);
  };

  const saveCardBio = async (e, folder) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (e && e.preventDefault)  e.preventDefault();
    const bio = cardDraftRef.current;
    const previous = memberBios[folder];

    // optimistic: update card immediately, exit edit mode, then sync to DB
    setMemberBios(prev => ({ ...prev, [folder]: bio }));
    setEditingCard(null);
    setCardError("");
    setSavingCard(true);

    try {
      const r = await fetch("/api/family/member-bio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, bio }),
      });
      if (!r.ok) {
        const err = await r.text();
        console.error("member-bio PATCH error:", err);
        // revert + surface failure
        setMemberBios(prev => ({ ...prev, [folder]: previous ?? "" }));
        setCardError(`save failed for ${folder} — try again`);
        setEditingCard(folder);
        cardDraftRef.current = bio;
        setCardDraft(bio);
      } else {
        const d = await r.json();
        setMemberBios(prev => ({ ...prev, [folder]: d.bio ?? bio }));
      }
    } catch (err) {
      console.error("member-bio PATCH:", err);
      setMemberBios(prev => ({ ...prev, [folder]: previous ?? "" }));
      setCardError(`network error for ${folder} — try again`);
      setEditingCard(folder);
      cardDraftRef.current = bio;
      setCardDraft(bio);
    }
    setSavingCard(false);
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
        .fam-card:hover  { transform: scale(1.02); }
        .fam-card:active { transform: scale(1.06); }
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

      <FamilyTree memberPhotos={memberPhotos} openModal={openModal} />

      <section style={{ padding: "0 1.25rem" }}>
        <span style={LABEL_STYLE}>the team</span>
        <div className="fam-cards-grid">
          {MEMBERS.map(member => {
            const photos = memberPhotos[member.folder] || [];
            const cover  = photos[0];
            const savedBio   = memberBios[member.folder];
            const displayBio = savedBio !== undefined && savedBio !== ""
              ? savedBio
              : member.bio;
            return (
              <div key={member.folder} className="fam-card">
                {/* image area — click opens modal */}
                <div
                  style={{ position: "relative", width: "100%", height: "160px", cursor: "pointer" }}
                  onClick={(e) => openModal(member, e)}
                >
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

                {/* text area — bio is editable inline */}
                <div style={{ padding: "0.55rem 0.7rem 0.65rem" }} onClick={e => e.stopPropagation()}>
                  <p style={{ margin: 0, color: TEXT, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.03em", textTransform: "capitalize" }}>
                    {member.displayName}
                  </p>
                  {editingCard === member.folder ? (
                    <form
                      onSubmit={e => saveCardBio(e, member.folder)}
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        value={cardDraft}
                        onChange={e => {
                          cardDraftRef.current = e.target.value;
                          setCardDraft(e.target.value);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Escape") { e.preventDefault(); setEditingCard(null); }
                        }}
                        autoFocus
                        style={{
                          width: "100%", boxSizing: "border-box",
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid rgba(200,133,74,0.3)",
                          borderRadius: "4px",
                          color: "#fff",
                          fontSize: "0.7rem", fontStyle: "italic",
                          padding: "5px 7px", fontFamily: "inherit", outline: "none",
                        }}
                      />
                      {cardError && (
                        <p style={{ margin: "3px 0 0", color: "#e07878", fontSize: "0.6rem" }}>
                          {cardError}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.35rem" }}>
                        <button
                          type="submit"
                          disabled={savingCard}
                          onMouseDown={e => e.preventDefault()}
                          style={{
                            background: "rgba(200,133,74,0.2)",
                            border: "1px solid rgba(200,133,74,0.45)",
                            borderRadius: "4px", padding: "3px 12px",
                            color: "#c8854a", fontSize: "0.6rem", fontWeight: 600,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            cursor: "pointer", fontFamily: "inherit",
                            minHeight: "26px", touchAction: "manipulation",
                          }}
                        >{savingCard ? "…" : "save"}</button>
                        <button
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={e => { e.stopPropagation(); setEditingCard(null); setCardError(""); }}
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "4px", padding: "3px 12px",
                            color: "rgba(255,255,255,0.4)", fontSize: "0.6rem",
                            cursor: "pointer", fontFamily: "inherit",
                            minHeight: "26px", touchAction: "manipulation",
                          }}
                        >cancel</button>
                      </div>
                    </form>
                  ) : (
                    <p
                      onClick={e => startCardEdit(e, member.folder)}
                      title="tap to edit"
                      style={{
                        margin: 0, color: "rgba(255,255,255,0.3)",
                        fontSize: "0.64rem", fontStyle: "italic", lineHeight: 1.4,
                        cursor: "text", borderBottom: "1px dashed rgba(255,255,255,0.07)",
                      }}
                    >
                      {displayBio}
                    </p>
                  )}
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
          originRect={modal.originRect}
          onClose={() => setModal(null)}
          onBioSaved={handleBioSaved}
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
    const count  = Math.min(12, photos.length);
    const rotAmp = isMobile ? 0.4 : 0.8;

    const loop = ts => {
      for (let i = 0; i < count; i++) {
        const el = imgRefs.current[i];
        if (!el) continue;
        const { period, phase, amp } = SCATTER_ANIM[i];
        const ω = PI2 / period;
        const a = isMobile ? 3 : amp;
        const rot = SCATTER_POS[i].rotate + rotAmp * Math.sin(ω * ts * 1.31 + phase);
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
        .fam-sc-wrap { transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .fam-sc-wrap:hover { transform: scale(1.1) !important; }
      `}</style>
      <div style={{ position: "relative", width: "100%", height: `${containerH}px`, overflow: "hidden" }}>
        {photos.slice(0, Math.min(12, photos.length)).map((photo, i) => {
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
                  sizes={isMobile ? "96px" : "200px"}
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
      <div style={{ minHeight: "100vh" }}>

        <HeroSection
          fetchUrl="/api/headers"
          title="FAMILY"
          subtitle="always & forever"
        />

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
          ariaLabel="Add a memory"
          className="ng-fab"
        >
          <span className="ng-fab-plus" aria-hidden="true" />
        </UploadButton>

      </div>
    </Providers>
  );
}
