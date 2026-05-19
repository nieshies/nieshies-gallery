"use client";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const variants = {
  initial: { clipPath: "circle(120% at 50% 50%)" },
  exit: { clipPath: "circle(0% at 50% 50%)", transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] } },
  enter: {
    clipPath: "circle(120% at 50% 50%)",
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.35 },
  },
};

export default function PagePortal({ children }) {
  const pathname = usePathname();
  const prevRef = useRef(pathname);
  const isFirst = prevRef.current === pathname;
  prevRef.current = pathname;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={isFirst ? false : "initial"}
        animate="enter"
        exit="exit"
        variants={variants}
      >
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none"
          initial={false}
          animate={isFirst ? false : { scale: [1, 1.02, 1], opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.6, times: [0, 0.3, 1] }}
          style={{
            background: "radial-gradient(ellipse at center, rgba(244,140,54,0.15) 0%, transparent 70%)",
          }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
