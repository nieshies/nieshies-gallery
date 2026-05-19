"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "favorites", label: "Favorites First" },
  { value: "name", label: "Alphabetical" },
  { value: "largest", label: "Largest Files" },
  { value: "smallest", label: "Smallest Files" },
];

export default function GalleryOmnibar({ photos, onFilter }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [focusIdx, setFocusIdx] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const allTags = [...new Set(photos.flatMap((p) => p.tags || []))].sort();

  const filteredPhotos = useCallback(() => {
    let result = [...photos];
    if (activeTags.length > 0) {
      result = result.filter((p) => activeTags.some((t) => (p.tags || []).includes(t)));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          (p.caption && p.caption.toLowerCase().includes(q)) ||
          p.name.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => a.uploadedAt - b.uploadedAt);
        break;
      case "favorites":
        result.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "largest":
        result.sort((a, b) => b.sizeBytes - a.sizeBytes);
        break;
      case "smallest":
        result.sort((a, b) => a.sizeBytes - b.sizeBytes);
        break;
      default:
        result.sort((a, b) => b.uploadedAt - a.uploadedAt);
    }
    return result;
  }, [photos, activeTags, query, sortBy]);

  useEffect(() => {
    onFilter(filteredPhotos());
  }, [filteredPhotos, onFilter]);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (open) {
      setFocusIdx(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const toggleTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    const items = allTags.filter((t) => t.toLowerCase().includes(query.toLowerCase()));
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === "Enter" && focusIdx >= 0 && items[focusIdx]) {
      e.preventDefault();
      toggleTag(items[focusIdx]);
    }
  };

  useEffect(() => {
    if (focusIdx >= 0 && listRef.current) {
      const el = listRef.current.children[focusIdx];
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [focusIdx]);

  return (
    <div className="relative">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.04] text-white/50 text-xs font-mono hover:border-white/30 hover:text-white/70 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Filter & Sort
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-white/10 text-[10px] tracking-wider">⌘K</kbd>
        </button>

        {activeTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-a1/40 bg-a1/10 text-a1 text-xs hover:bg-a1/20 transition-all"
          >
            {tag}
            <span className="text-a1/60 hover:text-a1">&times;</span>
          </button>
        ))}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-full border border-white/10 bg-black/40 text-white/50 text-xs font-mono outline-none cursor-pointer hover:border-white/30 transition-colors appearance-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#111]">
              {opt.label}
            </option>
          ))}
        </select>

        {activeTags.length > 0 && (
          <button
            onClick={() => setActiveTags([])}
            className="text-white/30 text-[10px] font-mono hover:text-white/60 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-full max-w-md z-40"
          >
            <div className="border border-white/10 rounded-2xl bg-[rgba(13,13,26,0.95)] backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setFocusIdx(-1); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search captions, tags, filenames..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none"
                  autoComplete="off"
                />
              </div>

              <div className="max-h-60 overflow-y-auto" ref={listRef}>
                {allTags.length === 0 && (
                  <p className="text-white/20 text-xs text-center py-6 font-mono">No tags found</p>
                )}
                {allTags
                  .filter((t) => t.toLowerCase().includes(query.toLowerCase()))
                  .map((tag, i) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      onMouseEnter={() => setFocusIdx(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        focusIdx === i ? "bg-white/[0.06] text-white" : "text-white/60"
                      } ${activeTags.includes(tag) ? "text-a1" : ""}`}
                    >
                      <span className="text-white/20">#</span>
                      {tag}
                      {activeTags.includes(tag) && (
                        <span className="ml-auto text-a1 text-xs">active</span>
                      )}
                    </button>
                  ))}
              </div>

              <div className="flex items-center gap-3 px-4 py-2 border-t border-white/5 text-[10px] text-white/25 font-mono">
                <span><kbd className="px-1 py-0.5 rounded bg-white/10">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/10">↵</kbd> Toggle tag</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/10">Esc</kbd> Close</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
