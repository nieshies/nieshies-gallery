"use client";
import { useState, useEffect } from "react";

const TARGET = new Date("2023-12-02T00:00:00");

export default function DayCounter() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const tick = () => {
      const diff = Date.now() - TARGET.getTime();
      setDays(Math.floor(diff / 86400000));
    };
    tick();
    const id = setInterval(tick, 300000);
    return () => clearInterval(id);
  }, []);

  const digits = String(days).split("");

  return (
    <div className="flex justify-center gap-1.5 py-16 select-none">
      {digits.map((d, i) => (
        <span
          key={i}
          className="inline-flex h-10 w-8 items-center justify-center rounded-md border border-white/12 bg-white/[0.03] text-sm font-semibold tracking-wide text-[#f48c36]"
        >
          {d}
        </span>
      ))}
    </div>
  );
}
