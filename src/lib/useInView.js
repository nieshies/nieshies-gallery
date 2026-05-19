"use client";
import { useRef, useState, useEffect } from "react";

export default function useInView({ threshold = 0.1, repeat = false } = {}) {
  const ref = useRef(null);
  const [, forceUpdate] = useState(0);

  const setRef = (el) => {
    if (ref.current === el) return;
    ref.current = el;
    forceUpdate((n) => n + 1);
  };

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
    // ref.current changes trigger re-render via forceUpdate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, repeat, ref.current]);

  return [setRef, inView];
}
