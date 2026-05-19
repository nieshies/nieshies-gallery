"use client";
import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ScrollGallery({ photos }) {
  const containerRef = useRef(null);

  const scrollTo = useCallback((dir) => {
    const el = containerRef.current;
    if (!el) return;
    const sections = el.querySelectorAll("section");
    const currentScroll = el.scrollTop;
    if (dir === "next") {
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop > currentScroll + 10) {
          sections[i].scrollIntoView({ behavior: "smooth" });
          break;
        }
      }
    } else {
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop < currentScroll - 10) {
          sections[i].scrollIntoView({ behavior: "smooth" });
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleKey = (e) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        scrollTo("next");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollTo("prev");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [scrollTo]);

  const total = photos.length;

  return (
    <>
      <div
        ref={containerRef}
        style={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          background: "#000",
        }}
      >
        <section
          style={{
            scrollSnapAlign: "start",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            color: "#fff",
            position: "relative",
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ fontSize: "clamp(2rem, 8vw, 6rem)", fontWeight: 300, letterSpacing: "0.1em" }}
          >
            nieshies&apos; dump
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.2, duration: 1 }}
            style={{ marginTop: "2rem", fontSize: "0.9rem", letterSpacing: "0.3em", textTransform: "uppercase" }}
          >
            scroll
          </motion.p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{ marginTop: "1rem", opacity: 0.4, fontSize: "1.2rem" }}
          >
            ↓
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 2.5, duration: 1 }}
            style={{
              position: "absolute",
              bottom: "2.5rem",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Tap anywhere to continue
          </motion.p>
        </section>

        {photos.map((photo, i) => (
          <section
            key={photo.id}
            style={{
              scrollSnapAlign: "start",
              height: "100vh",
              position: "relative",
              background: "#000",
              overflow: "hidden",
            }}
            className="scroll-gallery-section"
          >
            <Image
              src={photo.url}
              alt={photo.caption || `Memory ${i + 1}`}
              fill
              style={{ objectFit: "cover" }}
              priority={i < 3}
              sizes="100vw"
            />
            <div className="scroll-grain" />
            {photo.caption ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.8 }}
                style={{
                  position: "absolute",
                  bottom: "2.5rem",
                  left: "2.5rem",
                  color: "#fff",
                  fontSize: "0.95rem",
                  fontWeight: 300,
                  letterSpacing: "0.05em",
                  textShadow: "0 1px 8px rgba(0,0,0,0.8)",
                  maxWidth: "60%",
                }}
              >
                {photo.caption}
              </motion.div>
            ) : null}
            <div
              style={{
                position: "absolute",
                bottom: "2.5rem",
                right: "2.5rem",
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </div>
          </section>
        ))}

        <section
          style={{
            scrollSnapAlign: "start",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            color: "#fff",
          }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            transition={{ duration: 1 }}
            style={{ fontSize: "0.9rem", letterSpacing: "0.3em", textTransform: "uppercase" }}
          >
            more memories soon
          </motion.p>
        </section>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.15)",
          fontSize: "0.65rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        the night keeps developing
      </div>
    </>
  );
}
