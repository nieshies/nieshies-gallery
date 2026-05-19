"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import ContributionHeatmap from "./ContributionHeatmap";
import StorageRing from "./StorageRing";
import BatchUploader from "./BatchUploader";
import BulkManager from "./BulkManager";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

function StatCard({ title, value, icon, hue, index }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ scale: 1.04, y: -4 }}
      className="border border-white/10 rounded-2xl p-4 bg-[rgba(13,13,26,0.75)] backdrop-blur-sm shadow-lg"
      style={{ borderColor: `hsla(${hue}, 80%, 60%, 0.3)` }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="m-0 text-xs font-display uppercase tracking-widest text-white/60">{title}</h3>
      </div>
      <p className="m-0 text-[clamp(1.5rem,5vw,2.5rem)] font-extrabold" style={{ color: `hsl(${hue}, 85%, 65%)` }}>
        {value}
      </p>
    </motion.div>
  );
}

function RadarScan() {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(function tick(t) {
      setAngle((t * 0.03) % 360);
      requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,245,212,0.15)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0,245,212,0.1)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(0,245,212,0.05)" strokeWidth="0.5" />
        <line x1="50" y1="50" x2={50 + 45 * Math.cos((angle * Math.PI) / 180)} y2={50 + 45 * Math.sin((angle * Math.PI) / 180)} stroke="#00f5d4" strokeWidth="1" opacity="0.6" />
        <circle cx="50" cy="50" r="2" fill="#00f5d4" opacity="0.8" />
        <circle cx="35" cy="40" r="1.5" fill="#ff3af2" opacity="0.6" />
        <circle cx="65" cy="55" r="1" fill="#ffe600" opacity="0.5" />
        <circle cx="45" cy="70" r="1.2" fill="#7b2fff" opacity="0.5" />
        <circle cx="55" cy="30" r="0.8" fill="#00f5d4" opacity="0.4" />
      </svg>
    </div>
  );
}

function LifeUpdates() {
  const [updates, setUpdates] = useState([]);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [posting, setPosting] = useState(false);
  const feedRef = useRef(null);

  const fetchUpdates = useCallback(() => {
    fetch("/api/updates")
      .then((r) => r.json())
      .then(setUpdates)
      .catch(() => {});
  }, []);

  useEffect(() => { fetchUpdates(); }, [fetchUpdates]);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, author: author || "Anonymous" }),
      });
      if (res.ok) {
        setContent("");
        fetchUpdates();
        feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {}
    setPosting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="border border-white/10 rounded-2xl bg-[rgba(13,13,26,0.75)] backdrop-blur-sm shadow-lg p-5"
      style={{ borderColor: "hsla(170, 80%, 60%, 0.2)" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">&#x1F4DD;</span>
        <h2 className="m-0 font-display uppercase text-sm tracking-widest text-white/60">
          CAPTAIN&apos;S LOG
        </h2>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={40}
          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-a2/50 transition-colors"
        />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="What are you up to, captain? &#x1F680;"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
          className="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-a2/50 transition-colors"
          autoComplete="off"
        />
        <button
          onClick={handlePost}
          disabled={posting || !content.trim()}
          className="min-h-11 min-w-11 px-4 rounded-lg bg-a2/20 border border-a2/40 text-a2 font-display text-sm font-bold uppercase tracking-wider hover:bg-a2/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          &#x2191;
        </button>
      </div>

      <div
        ref={feedRef}
        className="mt-4 space-y-2 max-h-48 overflow-y-auto scrollbar-thin"
      >
        {updates.length === 0 && (
          <p className="text-white/30 text-xs text-center py-4 font-mono">
            No transmissions yet. Be the first to log your status.
          </p>
        )}
        {updates.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
          >
            <span className="text-lg mt-0.5 shrink-0">
              {["&#x1F30C;", "&#x1F30D;", "&#x2604;", "&#x1F4A0;", "&#x1F31F;", "&#x1FA90;"][i % 6]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm text-white/80 break-words">{u.content}</p>
              <p className="m-0 mt-1 text-[10px] text-white/30 font-mono">
                {u.author} &middot; {timeAgo(u.createdAt)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ totalPhotos: 0, favoriteCount: 0, totalBytes: 0, social: { uploads: 0, likes: 0, comments: 0, profiles: 0 } });
  const [photos, setPhotos] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(() => {
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
    fetch("/api/photos", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const handleUploaded = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <RadarScan />
        <h1 className="m-0 font-display uppercase text-3xl tracking-widest text-white">
          Mission Control
        </h1>
        <p className="m-0 mt-1 text-sm text-white/40 font-mono tracking-wide">
          SYSTEM STATUS &mdash; STANDBY
        </p>
      </motion.div>

      <div>
        <h2 className="m-0 mb-3 font-display uppercase text-sm tracking-widest text-white/50">
          &#x25C6; GALLERY SECTOR
        </h2>
        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-3">
          <StatCard title="Photos Archived" value={stats.totalPhotos} icon="&#x1F30C;" hue={280} index={0} />
          <StatCard title="Favorites" value={stats.favoriteCount} icon="&#x2605;" hue={45} index={1} />
          <StatCard title="Data Stored" value={(stats.totalBytes / (1024 * 1024)).toFixed(2) + " MB"} icon="&#x1F4BE;" hue={190} index={2} />
        </div>
      </div>

      <div>
        <h2 className="m-0 mb-3 font-display uppercase text-sm tracking-widest text-white/50">
          &#x25C6; SOCIAL SECTOR
        </h2>
        <div className="grid grid-cols-4 max-md:grid-cols-2 gap-3">
          <StatCard title="Uploads" value={stats.social.uploads} icon="&#x1F4E1;" hue={320} index={3} />
          <StatCard title="Likes" value={stats.social.likes} icon="&#x2665;" hue={350} index={4} />
          <StatCard title="Comments" value={stats.social.comments} icon="&#x1F4AC;" hue={170} index={5} />
          <StatCard title="Crew" value={stats.social.profiles} icon="&#x1F464;" hue={60} index={6} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ContributionHeatmap />
        <StorageRing />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BatchUploader onUploaded={handleUploaded} />
        <LifeUpdates />
      </div>

      <BulkManager photos={photos} onUpdate={handleUploaded} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center gap-3 pt-2"
      >
        <Button to="/">&#x2190; Home</Button>
        <Button to="/feed" variant="ghost">&#x1F30D; Feed</Button>
      </motion.div>
    </div>
  );
}
