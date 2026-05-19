"use client";
import { useEffect, useRef, useCallback } from "react";
import ScatteredHero from "./ScatteredHero";
import PhotoSection from "./PhotoSection";

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

  if (!photos?.length) {
    return (
      <div style={{ height: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>
        no memories yet
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        style={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          background: "#000",
          position: "relative",
        }}
      >
        <ScatteredHero photos={photos} />

        {photos.map((photo, i) => (
          <PhotoSection key={photo.id} photo={photo} index={i} total={photos.length} />
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
            flexShrink: 0,
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.9rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            more memories soon
          </p>
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
