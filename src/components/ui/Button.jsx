"use client";
import Link from "next/link";

const variants = {
  primary: "min-h-11 min-w-11 inline-flex items-center justify-center px-4 py-2.5 rounded-full border-3 border-a2 text-white font-display tracking-wider uppercase no-underline cursor-pointer bg-a5/30 hover:bg-a5/50",
  ghost: "min-h-11 min-w-11 inline-flex items-center justify-center px-4 py-2.5 rounded-full border-3 border-white/25 border-dashed text-white font-display tracking-wider uppercase cursor-pointer bg-white/5 hover:bg-white/10",
  mini: "min-h-11 min-w-11 inline-flex items-center justify-center px-3 border-2 border-white/35 rounded-full bg-white/4 text-white cursor-pointer",
};

export default function Button({ variant = "primary", to, children, className = "", ...props }) {
  const cls = `${variants[variant]} ${className}`.trim();

  if (to) {
    return <Link href={to} className={cls}>{children}</Link>;
  }
  return <button className={cls} {...props}>{children}</button>;
}
