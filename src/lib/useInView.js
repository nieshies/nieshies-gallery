"use client";
import { useRef, useState, useEffect, useCallback } from "react";

export default function useInView({ threshold = 0.1, repeat = false } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);

  const setRef = useCallback((el) => {
    ref.current = el;
    setReady(!!el);
  }, []);

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
  }, [threshold, repeat, ready]);

  return [setRef, inView];
}
