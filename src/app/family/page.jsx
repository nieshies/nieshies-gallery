"use client";
import { useEffect, useRef, useState } from "react"; // useRef kept for scatter RAF
import Image from "next/image";
import Providers from "../providers";
import HeroSection from "@/components/sections/HeroSection";
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

function MemberModal({ member, photos, onClose, onBioSaved }) {
  const hero = photos[0];
  const song = MEMBER_SONGS[member.folder];

  // ── music refs ───────────────────────────────────────────────────────────
  const playerRef  = useRef(null);
  const loopRef    = useRef(null);
  const mountedRef = useRef(true);
  const startedRef = useRef(false);
  // "idle" → "playing" → "muted" (idle = not yet started; iOS needs gesture)
  const [audioState, setAudioState] = useState("idle");

  // ── keyboard + scroll lock ────────────────────────────────────────────────
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

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
          maxWidth: "640px",
          background: SURFACE,
          borderRadius: "18px",
          overflow: "hidden",
          border: `1px solid ${BORDER}`,
          marginTop: "2rem",
        }}
      >
        {hero ? (
          <div style={{ position: "relative", width: "100%", aspectRatio: "4/3" }}>
            <Image
              src={getPhotoUrl(hero.url, "medium")}
              alt=""
              fill
              style={{ objectFit: "cover", filter: "brightness(0.88)" }}
              sizes="640px"
              priority
            />
          </div>
        ) : (
          <div style={{ width: "100%", aspectRatio: "4/3", background: "rgba(200,133,74,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ margin: 0, color: "rgba(200,133,74,0.3)", fontSize: "11px", letterSpacing: "0.2em" }}>no photos yet</p>
          </div>
        )}

        <div style={{ padding: "1.2rem 1.4rem 0.9rem" }}>
          <p style={{ margin: 0, color: "#fff", fontSize: "1.15rem", fontWeight: 600, letterSpacing: "0.02em", textTransform: "capitalize" }}>
            {member.displayName}
          </p>
          <p style={{ margin: "0.2rem 0 0.5rem", color: ACCENT, fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {member.role}
          </p>

          {editingBio ? (
            <div onClick={e => e.stopPropagation()}>
              <textarea
                value={draftBio}
                onChange={e => setDraftBio(e.target.value)}
                rows={3}
                autoFocus
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(200,133,74,0.2)",
                  borderRadius: "6px",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.78rem", fontStyle: "italic",
                  lineHeight: 1.5, padding: "0.45rem 0.6rem",
                  resize: "none", fontFamily: "inherit", outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.45rem" }}>
                <button
                  onClick={saveBio}
                  disabled={savingBio}
                  style={{
                    background: "rgba(200,133,74,0.15)",
                    border: "1px solid rgba(200,133,74,0.3)",
                    borderRadius: "6px", padding: "4px 14px",
                    color: "#c8854a", fontSize: "0.72rem",
                    cursor: savingBio ? "default" : "pointer",
                    fontFamily: "inherit", letterSpacing: "0.05em",
                    minHeight: "32px", touchAction: "manipulation",
                  }}
                >
                  {savingBio ? "saving…" : "save"}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setDraftBio(currentBio); setEditingBio(false); }}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px", padding: "4px 14px",
                    color: "rgba(255,255,255,0.3)", fontSize: "0.72rem",
                    cursor: "pointer", fontFamily: "inherit",
                    letterSpacing: "0.05em", minHeight: "32px",
                    touchAction: "manipulation",
                  }}
                >
                  cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              onClick={e => { e.stopPropagation(); setEditingBio(true); setDraftBio(currentBio); }}
              title="tap to edit"
              style={{
                margin: 0, color: "rgba(255,255,255,0.38)",
                fontSize: "0.78rem", fontStyle: "italic", lineHeight: 1.5,
                cursor: "text", borderBottom: "1px dashed rgba(255,255,255,0.08)",
                paddingBottom: "2px",
              }}
            >
              {currentBio}
            </p>
          )}
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
                  sizes="140px"
                  loading={i < 3 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        )}

        {song && (
          <div style={{ padding: "0 1.4rem 1.1rem", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handlePill}
              style={{
                background: "rgba(0,0,0,0.35)",
                border: `0.5px solid ${pillBorder}`,
                borderRadius: "20px",
                padding: "5px 13px",
                display: "flex", alignItems: "center", gap: "5px",
                color: pillColor,
                fontSize: "10px", letterSpacing: "0.08em",
                cursor: "pointer", fontFamily: "inherit",
                transition: "border-color 0.2s, color 0.2s",
                minHeight: "44px", minWidth: "44px",
                touchAction: "manipulation",
              }}
            >
              {pillLabel}
            </button>
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
        onClick={() => openModal(member)}
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

  const openModal = member => {
    const photos = memberPhotos[member.folder] || [];
    setModal({ member, photos });
  };

  const handleBioSaved = (folder, bio) => {
    setMemberBios(prev => ({ ...prev, [folder]: bio }));
  };

  const startCardEdit = (e, folder) => {
    e.stopPropagation();
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
                  onClick={() => openModal(member)}
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
