"use client";
import { useState, useEffect } from "react";

const TARGET = new Date("2023-12-02T00:00:00");

const STYLES = {
  default: {
    box: "border-white/12 bg-white/[0.03] text-[#f48c36]",
    wrapper: "py-16",
  },
  amnie: {
    box: "border-rose-200/20 bg-white/[0.04] text-rose-300",
    wrapper: "pb-24 pt-8",
  },
};

export default function DayCounter({ variant = "default" }) {
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
  const s = STYLES[variant] || STYLES.default;

  return (
    <div className={`flex justify-center gap-1.5 ${s.wrapper} select-none`}>
      {digits.map((d, i) => (
        <span
          key={i}
          className={`inline-flex h-10 w-8 items-center justify-center rounded-md border ${s.box} text-sm font-semibold tracking-wide`}
        >
          {d}
        </span>
      ))}
    </div>
  );
}
