"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { chunkItems, splitGalleryItems } from "@/lib/normalizeGalleryItems";

function useMouseGlow() {
  const frameRef = useRef(null);
  const onMouseMove = (e) => {
    const element = e.currentTarget;
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--glow-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      element.style.setProperty("--glow-y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
      frameRef.current = null;
    });
  };

  const onMouseLeave = (e) => {
    e.currentTarget.style.setProperty("--glow-x", "50%");
    e.currentTarget.style.setProperty("--glow-y", "50%");
  };

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  return { onMouseMove, onMouseLeave };
}

export const CinematicCard = memo(function CinematicCard({ item, onClick, className = "", priority = false, style }) {
  const { onMouseMove, onMouseLeave } = useMouseGlow();

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`cinematic-card group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] text-left shadow-[0_24px_80px_rgba(0,0,0,0.45)] ${className}`}
      style={{
        ...style,
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-70 transition-opacity duration-[var(--motion-hover)] group-hover:opacity-100" />
      <img
        src={item.src}
        alt=""
        loading={priority ? "eager" : "lazy"}
        className="cinematic-card-image h-full w-full object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5">
        {item.meta?.label ? (
          <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-accent/90">
            {item.meta.label}
          </p>
        ) : null}
        <p className="max-w-[18ch] translate-y-3 text-sm leading-relaxed text-white/0 transition-all duration-[var(--motion-hover)] group-hover:translate-y-0 group-hover:text-white/88">
          {item.caption || " "}
        </p>
      </div>
    </button>
  );
});

function CinematicHero({ items, eyebrow, title, description }) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || items.length < 2) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [items.length, reduceMotion]);

  if (!items.length) return null;

  return (
    <section className="relative min-h-[112svh] overflow-hidden">
      <div className="absolute inset-0">
        {items.slice(0, 5).map((item, itemIndex) => (
          <div
            key={item.id}
            className="absolute inset-0 transition-[opacity,transform,filter] duration-[1400ms]"
            style={{
              opacity: itemIndex === index ? 1 : 0,
              transform: itemIndex === index ? "scale(1)" : "scale(1.04)",
              filter: itemIndex === index ? "brightness(0.62)" : "brightness(0.45)",
            }}
          >
            <img src={item.src} alt="" className="h-full w-full object-cover object-center" />
          </div>
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,140,54,0.22),transparent_40%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.82))]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[112svh] w-full max-w-7xl items-end px-6 pb-16 pt-28 sm:px-10 lg:pl-28 lg:pr-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-accent/75">{eyebrow}</p>
          <h1 className="max-w-[10ch] text-[clamp(3.3rem,10vw,7.2rem)] font-display uppercase leading-[0.9] tracking-[-0.05em] text-white">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/62 sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

function SequencedStory({ items, onItemClick }) {
  const ref = useRef(null);
  const frameRefs = useRef([]);
  const tickingRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const frames = items.slice(0, 6);

  useEffect(() => {
    if (!ref.current || reduceMotion) return;

    const updateFrames = () => {
      const rect = ref.current.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / total));

      frameRefs.current.forEach((node, idx) => {
        if (!node) return;
        const active = frames.length === 1 ? 1 : idx / (frames.length - 1);
        const distance = Math.abs(progress - active);
        const opacity = Math.max(0, 1 - distance * 3.2);
        const translateY = distance * 90;
        const scale = 1 - Math.min(distance * 0.18, 0.14);

        node.style.opacity = String(opacity);
        node.style.transform = `translateY(${translateY}px) scale(${scale})`;
        node.style.pointerEvents = opacity > 0.55 ? "auto" : "none";
      });
    };

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        updateFrames();
        tickingRef.current = false;
      });
    };

    updateFrames();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [reduceMotion, frames.length]);

  if (!frames.length) return null;

  return (
    <section ref={ref} className="relative" style={{ height: reduceMotion ? "auto" : `${Math.max(320, frames.length * 72)}vh` }}>
      <div className="sticky top-0 flex min-h-svh items-center overflow-hidden px-6 py-14 sm:px-10 lg:pl-28 lg:pr-12">
        <div className="grid w-full gap-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-16">
          <div className="self-start lg:sticky lg:top-24">
            <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-accent/72">scroll sequence</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-display uppercase leading-[0.92] text-white">
              Frames step in one by one.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/55">
              The flow is portrait-first, paced like a memory strip instead of separate gallery widgets.
            </p>
          </div>

          <div className="relative mx-auto h-[70svh] w-full max-w-3xl">
            {frames.map((item, idx) => {
              return (
                <div
                  key={item.id}
                  ref={(node) => {
                    frameRefs.current[idx] = node;
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    zIndex: frames.length - idx,
                    pointerEvents: reduceMotion ? "auto" : "none",
                    opacity: reduceMotion ? 1 : undefined,
                    transform: reduceMotion ? "translateY(0) scale(1)" : undefined,
                  }}
                >
                  <CinematicCard
                    item={item}
                    onClick={onItemClick}
                    className="mx-auto h-[78%] w-[min(32rem,82vw)]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PortraitBands({ items, onItemClick }) {
  const groups = chunkItems(items.slice(0, 12), 3);
  if (!groups.length) return null;

  return (
    <section className="relative cinematic-lazy-section px-6 py-18 sm:px-10 lg:pl-28 lg:pr-12">
      <div className="mx-auto max-w-7xl space-y-12">
        {groups.map((group, groupIndex) => (
          <div
            key={`group-${groupIndex}`}
            className={`grid gap-5 sm:gap-6 ${group.length === 1 ? "grid-cols-1" : "md:grid-cols-3"}`}
          >
            {group.map((item, itemIndex) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.42, delay: Math.min(itemIndex * 0.05, 0.1) }}
                className={`${itemIndex === 1 ? "md:-translate-y-10" : ""} ${groupIndex % 2 === 1 && itemIndex === 0 ? "md:translate-y-8" : ""}`}
              >
                <CinematicCard
                  item={item}
                  onClick={onItemClick}
                  className="aspect-[9/16] min-h-[26rem] w-full"
                  priority={groupIndex === 0 && itemIndex < 2}
                />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function LandscapeBreathe({ items, onItemClick }) {
  if (!items.length) return null;

  return (
    <section className="cinematic-lazy-section px-6 py-16 sm:px-10 lg:pl-28 lg:pr-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-accent/70">wide frames</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-display uppercase leading-[0.92] text-white">
              Breathing room between the portraits.
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {items.slice(0, 4).map((item) => (
            <CinematicCard
              key={item.id}
              item={item}
              onClick={onItemClick}
              className="aspect-[16/10] min-h-[18rem] w-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalWall({ items, onItemClick }) {
  if (!items.length) return null;

  return (
    <section className="cinematic-lazy-section px-6 pb-24 pt-14 sm:px-10 lg:pl-28 lg:pr-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-[11px] uppercase tracking-[0.32em] text-accent/72">closing wall</p>
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-display uppercase leading-[0.94] text-white">
            The last frames stay in view.
          </h2>
        </div>

        <div className="grid auto-rows-[16rem] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.slice(0, 8).map((item, index) => (
            <CinematicCard
              key={item.id}
              item={item}
              onClick={onItemClick}
              className={`${index % 5 === 0 ? "row-span-2" : ""} h-full w-full`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CinematicGalleryPage({
  items,
  eyebrow,
  title,
  description,
  onItemClick,
  topSlot,
  midSlot,
  bottomSlot,
}) {
  const orderedItems = useMemo(
    () => [...items].sort((a, b) => Number(b.uploadedAt || 0) - Number(a.uploadedAt || 0)),
    [items],
  );
  const { portraits, landscapes } = useMemo(() => splitGalleryItems(orderedItems), [orderedItems]);
  const heroItems = orderedItems.slice(0, 5);
  const sequenceItems = portraits.length ? portraits : orderedItems;
  const finalWallItems = orderedItems.slice(4);

  return (
    <div className="relative overflow-hidden">
      <div className="cinematic-page-bg" aria-hidden="true" />
      <CinematicHero items={heroItems} eyebrow={eyebrow} title={title} description={description} />
      {topSlot}
      <PortraitBands items={portraits.length ? portraits : orderedItems.slice(0, 9)} onItemClick={onItemClick} />
      <SequencedStory items={sequenceItems} onItemClick={onItemClick} />
      {midSlot}
      <LandscapeBreathe items={landscapes} onItemClick={onItemClick} />
      <FinalWall items={finalWallItems.length ? finalWallItems : orderedItems} onItemClick={onItemClick} />
      {bottomSlot}
    </div>
  );
}
