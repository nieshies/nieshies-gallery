"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CELL_SIZE = 12;
const CELL_GAP = 3;
const WEEKS = 53;
const DAYS = 7;

function getIntensity(count, max) {
  if (!count || max === 0) return 0;
  const ratio = count / max;
  if (ratio === 0) return 0;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const INTENSITY_COLORS = {
  0: "bg-white/[0.04]",
  1: "bg-a2/15",
  2: "bg-a2/30",
  3: "bg-a2/50",
  4: "bg-a2/70",
};

export default function ContributionHeatmap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/stats/heatmap", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="border border-white/10 rounded-2xl bg-[rgba(13,13,26,0.75)] backdrop-blur-sm shadow-lg p-5">
        <div className="h-4 w-32 rounded bg-white/[0.06] animate-pulse mb-4" />
        <div className="flex gap-1">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="w-3 h-3 rounded-sm bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  const counts = data.counts || {};
  const values = Object.values(counts);
  const max = Math.max(...values, 1);

  const startDate = new Date(data.year, 0, 1);
  const startDay = startDate.getDay();
  const cells = [];

  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const dayIndex = w * DAYS + d - startDay;
      const date = new Date(data.year, 0, 1);
      date.setDate(date.getDate() + dayIndex);

      const dateStr = date.toISOString().slice(0, 10);
      const count = counts[dateStr] || 0;
      const isCurrentYear = date.getFullYear() === data.year;

      cells.push({
        week: w,
        day: d,
        date: dateStr,
        count,
        intensity: isCurrentYear ? getIntensity(count, max) : 0,
        isCurrentYear,
      });
    }
  }

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border border-white/10 rounded-2xl bg-[rgba(13,13,26,0.75)] backdrop-blur-sm shadow-lg p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-lg">&#x1F4CA;</span>
        <h3 className="m-0 font-display uppercase text-sm tracking-widest text-white/60">
          {data.year} Activity
        </h3>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="flex gap-1" style={{ minWidth: WEEKS * (CELL_SIZE + CELL_GAP) }}>
          <div className="flex flex-col gap-[3px] mr-1">
            {dayLabels.map((label, i) => (
              <div
                key={i}
                style={{ width: 24, height: CELL_SIZE }}
                className="text-[8px] text-white/20 font-mono leading-none flex items-center"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {Array.from({ length: WEEKS }, (_, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {cells
                  .filter((c) => c.week === w)
                  .sort((a, b) => a.day - b.day)
                  .map((c) => (
                    <div
                      key={c.date}
                      title={`${c.date}: ${c.count} upload${c.count !== 1 ? "s" : ""}`}
                      className={`w-3 h-3 rounded-sm transition-colors duration-200 ${INTENSITY_COLORS[c.intensity]} ${
                        c.isCurrentYear ? "" : "opacity-0"
                      }`}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[9px] text-white/30 font-mono">Less</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-sm ${INTENSITY_COLORS[i]}`}
          />
        ))}
        <span className="text-[9px] text-white/30 font-mono">More</span>
      </div>
    </motion.div>
  );
}
