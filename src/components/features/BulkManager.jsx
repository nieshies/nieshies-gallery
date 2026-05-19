"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function Checkmark({ selected }) {
  return (
    <div
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 ${
        selected
          ? "border-a2 bg-a2/30 scale-100"
          : "border-white/20 bg-transparent scale-90 group-hover:scale-100"
      }`}
    >
      {selected && (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
}

export default function BulkManager({ photos, onUpdate }) {
  const [selected, setSelected] = useState(new Set());
  const [batchTag, setBatchTag] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleAll = () => {
    if (selected.size === photos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(photos.map((p) => p.id)));
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const batchAction = async (action, value) => {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/photos/batch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selected),
          action,
          value,
        }),
      });
      if (res.ok) {
        setSelected(new Set());
        onUpdate?.();
      }
    } catch {}
    setBusy(false);
  };

  const batchDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} photo${selected.size > 1 ? "s" : ""}?`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/photos/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (res.ok) {
        setSelected(new Set());
        onUpdate?.();
      }
    } catch {}
    setBusy(false);
  };

  const hasSelection = selected.size > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="border border-white/10 rounded-2xl bg-[rgba(13,13,26,0.75)] backdrop-blur-sm shadow-lg p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">&#x1F4CB;</span>
          <h3 className="m-0 font-display uppercase text-sm tracking-widest text-white/60">
            Media Manager
          </h3>
        </div>
        <button
          onClick={() => setShowActions((v) => !v)}
          className="px-3 py-1 rounded-full border border-white/10 text-white/40 text-[10px] font-mono hover:border-white/30 hover:text-white/70 transition-all"
        >
          {showActions ? "Hide" : "Batch Actions"}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs text-white/40 font-mono">
        <button
          onClick={toggleAll}
          className="flex items-center gap-2 hover:text-white/70 transition-colors"
        >
          <Checkmark selected={selected.size === photos.length && photos.length > 0} />
          {selected.size === photos.length ? "Deselect all" : "Select all"}
        </button>
        {hasSelection && (
          <span className="text-a1">{selected.size} selected</span>
        )}
      </div>

      <AnimatePresence>
        {showActions && hasSelection && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <button
                onClick={() => batchAction("set-favorite", true)}
                disabled={busy}
                className="px-3 py-1.5 rounded-full border border-a1/30 bg-a1/10 text-a1 text-[11px] font-mono hover:bg-a1/20 disabled:opacity-40 transition-all"
              >
                &#10029; Favorite
              </button>
              <button
                onClick={() => batchAction("set-favorite", false)}
                disabled={busy}
                className="px-3 py-1.5 rounded-full border border-white/15 text-white/40 text-[11px] font-mono hover:border-white/30 disabled:opacity-40 transition-all"
              >
                &#10029; Unfavorite
              </button>
              <button
                onClick={() => batchAction("set-visibility", "public")}
                disabled={busy}
                className="px-3 py-1.5 rounded-full border border-a2/30 bg-a2/10 text-a2 text-[11px] font-mono hover:bg-a2/20 disabled:opacity-40 transition-all"
              >
                Public
              </button>
              <button
                onClick={() => batchAction("set-visibility", "unlisted")}
                disabled={busy}
                className="px-3 py-1.5 rounded-full border border-white/15 text-white/40 text-[11px] font-mono hover:border-white/30 disabled:opacity-40 transition-all"
              >
                Unlisted
              </button>
              <button
                onClick={() => batchAction("set-visibility", "private")}
                disabled={busy}
                className="px-3 py-1.5 rounded-full border border-a1/30 bg-a1/10 text-a1 text-[11px] font-mono hover:bg-a1/20 disabled:opacity-40 transition-all"
              >
                &#128274; Private
              </button>

              <div className="flex items-center gap-2 ml-2">
                <input
                  type="text"
                  value={batchTag}
                  onChange={(e) => setBatchTag(e.target.value)}
                  placeholder="Add tag..."
                  className="w-24 px-2 py-1.5 rounded-lg bg-black/50 border border-white/10 text-white text-[11px] font-mono placeholder-white/20 outline-none focus:border-a2/50 transition-colors"
                  maxLength={20}
                />
                <button
                  onClick={() => {
                    if (batchTag.trim()) {
                      batchAction("add-tags", [batchTag.trim()]);
                      setBatchTag("");
                    }
                  }}
                  disabled={busy || !batchTag.trim()}
                  className="px-2 py-1.5 rounded-lg bg-a3/20 border border-a3/30 text-a3 text-[11px] font-mono hover:bg-a3/30 disabled:opacity-40 transition-all"
                >
                  + Tag
                </button>
              </div>

              <button
                onClick={batchDelete}
                disabled={busy}
                className="ml-auto px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[11px] font-mono hover:bg-red-500/20 disabled:opacity-40 transition-all"
              >
                &#128465; Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-thin">
        {photos.length === 0 && (
          <p className="text-white/20 text-xs text-center py-8 font-mono">
            No photos to manage
          </p>
        )}
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.015 }}
            onClick={() => toggleOne(photo.id)}
            className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
              selected.has(photo.id)
                ? "bg-a1/[0.06] border border-a1/20"
                : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04]"
            }`}
          >
            <Checkmark selected={selected.has(photo.id)} />
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/30">
              <img
                src={`${photo.url}?t=${photo.uploadedAt}`}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70 truncate leading-tight">
                {photo.caption || photo.name}
              </p>
              <p className="text-[10px] text-white/30 font-mono">
                {new Date(photo.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono">
              {photo.favorite && <span className="text-a1">&#10029;</span>}
              {photo.tags?.length > 0 && (
                <span className="hidden sm:inline">{photo.tags.length} tags</span>
              )}
              <span>{formatBytes(photo.sizeBytes)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
