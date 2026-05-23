"use client";
import { useEffect, useRef, useState } from "react";

const SONG_ID    = "5ULWZkpH3Aw";
const START_S    = 114;
const LOOP_AT    = 197;   // seek back 1 s before the declared end to avoid gap
const TARGET_VOL = 30;
const FADE_STEP  = 5;
const FADE_MS    = 500;

// ── icons ─────────────────────────────────────────────────────────────────────

function IconWaiting() {
  return (
    <svg
      width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      className="amnie-pulse-icon"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconPlaying() {
  return (
    <svg
      width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function IconMuted() {
  return (
    <svg
      width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

export default function AmnieMusicAmbient() {
  const playerRef     = useRef(null);
  const loopRef       = useRef(null);
  const fadeRef       = useRef(null);
  const startedRef    = useRef(false);
  const mountedRef    = useRef(true);

  const [state,   setState]   = useState("waiting"); // "waiting" | "playing" | "muted"
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    // Off-screen DOM container — avoid any ID collisions
    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;";
    document.body.appendChild(container);

    const initPlayer = () => {
      if (!mountedRef.current || playerRef.current) return;
      playerRef.current = new window.YT.Player(container, {
        width:  1,
        height: 1,
        videoId: SONG_ID,
        playerVars: {
          autoplay:    0,
          controls:    0,
          disablekb:   1,
          fs:          0,
          rel:         0,
          start:       START_S,
          end:         198,
          loop:        1,
          playlist:    SONG_ID,
          playsinline: 1,   // required — prevents iOS Safari from opening fullscreen
          mute:        0,
        },
        events: {
          onReady: () => {
            if (!mountedRef.current) return;
            // Manual loop — YT's own loop occasionally has a silent gap on mobile
            loopRef.current = setInterval(() => {
              try {
                const t = playerRef.current?.getCurrentTime?.();
                if (t !== undefined && t >= LOOP_AT) {
                  playerRef.current.seekTo(START_S, true);
                }
              } catch {}
            }, 500);
          },
        },
      });
    };

    // Chain onto any existing onYouTubeIframeAPIReady so we don't clobber other callers
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevReady === "function") prevReady();
      initPlayer();
    };

    if (window.YT?.Player) {
      // API already loaded from a previous navigation — init immediately
      initPlayer();
    } else if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src   = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    // else: script is loading, onYouTubeIframeAPIReady will fire when ready

    // ── first-interaction gate (browser autoplay policy) ─────────────────────
    const handleFirstInteraction = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      document.removeEventListener("click",      handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);

      try {
        playerRef.current?.setVolume(0);
        playerRef.current?.playVideo();
      } catch {}

      if (mountedRef.current) setState("playing");

      // Fade 0 → 30 over 3 seconds
      let vol = 0;
      fadeRef.current = setInterval(() => {
        vol += FADE_STEP;
        try { playerRef.current?.setVolume(vol); } catch {}
        if (vol >= TARGET_VOL) {
          clearInterval(fadeRef.current);
          fadeRef.current = null;
        }
      }, FADE_MS);
    };

    document.addEventListener("click",      handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction, { passive: true });

    return () => {
      mountedRef.current = false;
      // removeEventListener is a no-op if listener was already removed — safe to call always
      document.removeEventListener("click",      handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      if (loopRef.current) clearInterval(loopRef.current);
      if (fadeRef.current) clearInterval(fadeRef.current);
      try {
        playerRef.current?.stopVideo();
        playerRef.current?.destroy();
      } catch {}
      playerRef.current = null;
      container.remove();
    };
  }, []);

  // ── mute button handler ───────────────────────────────────────────────────

  const handleClick = () => {
    if (state === "waiting") return; // not started yet — button is informational only
    if (state === "playing") {
      try { playerRef.current?.mute(); } catch {}
      setState("muted");
    } else {
      try { playerRef.current?.unMute(); } catch {}
      setState("playing");
    }
  };

  // ── derived styles ────────────────────────────────────────────────────────

  const color =
    state === "muted"   ? "#5a4838" :
    state === "playing" ? "#c8854a" :
    "rgba(200,133,74,0.5)";

  const label =
    state === "waiting" ? "♪ tap anywhere" :
    state === "playing" ? "♪ playing"      :
    "muted";

  const icon =
    state === "playing" ? <IconPlaying /> :
    state === "muted"   ? <IconMuted />   :
    <IconWaiting />;

  return (
    <>
      <style>{`
        @keyframes amnie-music-pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
        .amnie-pulse-icon {
          animation: amnie-music-pulse 1.8s ease-in-out infinite;
        }
      `}</style>

      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={
          state === "waiting" ? "Ambient music — tap anywhere to start" :
          state === "playing" ? "Mute ambient music" :
          "Unmute ambient music"
        }
        style={{
          position:             "fixed",
          bottom:               "max(20px, calc(env(safe-area-inset-bottom) + 12px))",
          right:                "max(20px, calc(env(safe-area-inset-right) + 12px))",
          zIndex:               999,
          background:           "rgba(14,12,8,0.85)",
          border:               `0.5px solid ${hovered ? "rgba(200,133,74,0.35)" : "#3a2e20"}`,
          borderRadius:         "20px",
          padding:              "6px 14px",
          display:              "flex",
          alignItems:           "center",
          gap:                  "6px",
          color,
          fontSize:             "10px",
          letterSpacing:        "0.06em",
          fontFamily:           "inherit",
          lineHeight:           1,
          opacity:              hovered ? 1 : 0.6,
          transition:           "opacity 0.2s, border-color 0.2s",
          cursor:               state === "waiting" ? "default" : "pointer",
          backdropFilter:       "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          userSelect:           "none",
          // iOS touch target — Apple recommends ≥ 44px
          minHeight:            "44px",
          minWidth:             "44px",
          touchAction:          "manipulation",
        }}
      >
        {icon}
        <span>{label}</span>
      </button>
    </>
  );
}
