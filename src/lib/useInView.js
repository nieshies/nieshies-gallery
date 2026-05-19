"use client";
import { useRef, useState, useEffect } from "react";

export default function useInView({ threshold = 0.1, repeat = false } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (!repeat) obs.unobserve(el);
        } else if (repeat) {
          setInView(false);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, repeat]);

  return [ref, inView];
}
