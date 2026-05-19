"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export default function StoryLightbox({ photos, index, onClose, onDelete }) {
  const [currentIdx, setCurrentIdx] = useState(index);
  const [playing, setPlaying] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [continueState, setContinueState] = useState(false);
  const [closing, setClosing] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const uiTimer = useRef(null);
  const touchX = useRef(0);

  const photo = photos[currentIdx];
  const hasNext = currentIdx < photos.length - 1;
  const hasPrev = currentIdx > 0;
  const isLast = currentIdx === photos.length - 1;

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  const goNext = useCallback(() => {
    if (hasNext) {
      setTransitioning(true);
      setContinueState(false);
      setTimeout(() => {
        setCurrentIdx((i) => i + 1);
        setPlaying(true);
        requestAnimationFrame(() => setTimeout(() => setTransitioning(false), 50));
      }, 200);
    } else if (!continueState) {
      setContinueState(true);
    }
  }, [hasNext, continueState]);

  const goPrev = useCallback(() => {
    if (hasPrev) {
      setTransitioning(true);
      setContinueState(false);
      setTimeout(() => {
        setCurrentIdx((i) => i - 1);
        setPlaying(true);
        requestAnimationFrame(() => setTimeout(() => setTransitioning(false), 50));
      }, 200);
    }
  }, [hasPrev]);

  useEffect(() => {
    if (!playing || isLast || continueState || transitioning) return;
    const t = setTimeout(goNext, 4000);
    return () => clearTimeout(t);
  }, [playing, currentIdx, isLast, continueState, transitioning, goNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    setConfirmDelete(false);
    setShowMenu(false);
  }, [currentIdx]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        if (confirmDelete) { setConfirmDelete(false); return; }
        if (showMenu) { setShowMenu(false); return; }
        close();
      }
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [close, goNext, goPrev, confirmDelete, showMenu]);

  const handleTap = useCallback((e) => {
    if (confirmDelete || deleting || transitioning) return;
    if (showMenu) { setShowMenu(false); return; }
    if (continueState) { close(); return; }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;

    if (x < 30) {
      goPrev();
    } else if (x > 70) {
      goNext();
    } else {
      setPlaying((v) => !v);
    }
  }, [goPrev, goNext, close, confirmDelete, deleting, showMenu, continueState, transitioning]);

  const handleTouchStart = useCallback((e) => {
    touchX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (confirmDelete || deleting || transitioning) return;
    if (continueState) { close(); return; }
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) {
      dx > 0 ? goPrev() : goNext();
    }
  }, [goPrev, goNext, close, confirmDelete, deleting, continueState, transitioning]);

  const handleMouseMove = useCallback(() => {
    if (confirmDelete) return;
    setShowUI(true);
    clearTimeout(uiTimer.current);
    uiTimer.current = setTimeout(() => {
      if (!showMenu) setShowUI(false);
    }, 3000);
  }, [confirmDelete, showMenu]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete?.(photo.id);
        close();
      }
    } finally {
      setDeleting(false);
    }
  }, [photo, onDelete, close]);

  if (!photo) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black select-none lightbox-overlay ${closing ? "closing" : "open"}`}
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
    >
      <div
        className={`w-full h-full flex items-center justify-center p-4 sm:p-8 lightbox-stage ${transitioning ? "exiting" : ""}`}
      >
        <img
          key={photo.id}
          src={`${photo.url}?t=${photo.uploadedAt}`}
          alt=""
          className="max-w-full max-h-full w-auto h-auto object-contain"
          draggable={false}
        />
      </div>

      <div className="absolute bottom-6 left-6 text-white/25 text-xs font-mono tracking-wider pointer-events-none select-none">
        {String(currentIdx + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
      </div>

      {!playing && !continueState && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-wider pointer-events-none select-none lightbox-fade-in">
          paused
        </div>
      )}

      {continueState && (
        <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 text-white/50 text-sm tracking-wider pointer-events-none select-none lightbox-fade-in">
          Tap anywhere to continue
        </div>
      )}

      {showUI && !continueState && (
        <div className="absolute inset-0 pointer-events-none lightbox-fade-in">
          <button
            onClick={(e) => { e.stopPropagation(); close(); }}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all text-lg pointer-events-auto"
          >
            &#10005;
          </button>

          <div className="absolute bottom-6 right-6 pointer-events-auto">
            {showMenu ? (
              <div className="bg-black/80 backdrop-blur-md border border-white/15 rounded-xl p-3 min-w-[140px]">
                {photo.caption && (
                  <p className="text-white/60 text-xs mb-2 pb-2 border-b border-white/10">{photo.caption}</p>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                  className="w-full text-left text-red-400 text-xs font-display uppercase tracking-wider hover:text-red-300 transition-colors"
                >
                  Delete photo
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all text-lg"
              >
                &#8942;
              </button>
            )}
          </div>
        </div>
      )}

      {confirmDelete && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/70"
          onClick={() => !deleting && setConfirmDelete(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="px-6 py-5 rounded-xl border border-white/15 bg-[rgba(10,10,10,0.95)] backdrop-blur-xl text-center max-w-xs"
          >
            <p className="text-white/70 text-sm font-display mb-4">Delete this photo?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-white/15 text-white/50 text-xs font-display uppercase tracking-wider hover:text-white/80 transition-all disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-display uppercase tracking-wider hover:bg-red-500/25 transition-all disabled:opacity-30"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
