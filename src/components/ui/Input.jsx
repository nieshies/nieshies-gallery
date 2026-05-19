"use client";
const cls = "bg-white/7 text-white border-2 border-white/25 rounded-xl p-2.5 min-h-[42px]";

export default function Input({ as: Component = "input", ...props }) {
  return <Component className={cls} {...props} />;
}
