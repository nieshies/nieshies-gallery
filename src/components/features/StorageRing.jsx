"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
  return (bytes / 1073741824).toFixed(2) + " GB";
}

function RingSegment({ value, max, color, label, offset, index }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? value / max : 0;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.15 }}
      className="flex flex-col items-center"
    >
      <svg width="130" height="130" className="-rotate-90">
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        <motion.circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, delay: index * 0.15, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white" style={{ color }}>
          {formatBytes(value)}
        </span>
        <span className="text-[10px] text-white/30 font-mono">{label}</span>
      </div>
    </motion.div>
  );
}

export default function StorageRing() {
  const [stats, setStats] = useState(null);
  const [bandwidth, setBandwidth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setBandwidth(Math.floor(data.totalBytes * 0.3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const capacityLimit = 500 * 1024 * 1024;
  const bwLimit = 2 * 1024 * 1024 * 1024;

  if (loading) {
    return (
      <div className="border border-white/10 rounded-2xl bg-[rgba(13,13,26,0.75)] backdrop-blur-sm shadow-lg p-5">
        <div className="h-4 w-28 rounded bg-white/[0.06] animate-pulse mb-6" />
        <div className="flex justify-center gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="w-[130px] h-[130px] rounded-full bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="border border-white/10 rounded-2xl bg-[rgba(13,13,26,0.75)] backdrop-blur-sm shadow-lg p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-lg">&#x1F4E6;</span>
        <h3 className="m-0 font-display uppercase text-sm tracking-widest text-white/60">
          Storage
        </h3>
      </div>

      <div className="flex justify-center gap-6 max-md:gap-3">
        <div className="relative flex items-center justify-center">
          <RingSegment
            value={stats?.totalBytes || 0}
            max={capacityLimit}
            color="#BC13FE"
            label="Used"
            index={0}
          />
        </div>
        <div className="relative flex items-center justify-center">
          <RingSegment
            value={bandwidth}
            max={bwLimit}
            color="#00FFFF"
            label="Bandwidth"
            index={1}
          />
        </div>
      </div>

      <div className="flex justify-between mt-4 text-[10px] text-white/30 font-mono">
        <span>
          {formatBytes(capacityLimit)} capacity
        </span>
        <span>
          {((stats?.totalBytes || 0) / capacityLimit * 100).toFixed(1)}% used
        </span>
      </div>
    </motion.div>
  );
}
