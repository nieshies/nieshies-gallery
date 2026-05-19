"use client";

import { useRef, useCallback, useEffect } from "react";
import slicePhotos from "@/lib/slicePhotos";
import detectOrientation from "@/lib/detectOrientation";
import HeroSection from "@/components/sections/HeroSection";
import FilmStrip from "@/components/sections/FilmStrip";
import StackStory from "@/components/sections/StackStory";
import ParallaxLayers from "@/components/sections/ParallaxLayers";
import FloatingCloud from "@/components/sections/FloatingCloud";
import HorizontalJourney from "@/components/sections/HorizontalJourney";
import CollageGrid from "@/components/sections/CollageGrid";
import CinematicViewer from "@/components/sections/CinematicViewer";
import MemoryWall from "@/components/sections/MemoryWall";

export default function ReferenceGalleryFlow({ photos, heroPhotos, title = "nieshies' dump", onPhotoClick }) {
  const containerRef = useRef(null);
  const { horizontal, vertical } = detectOrientation(photos);
  const verticalSections = slicePhotos(vertical, 5);
  const resolvedHeroPhotos = heroPhotos?.length ? heroPhotos : photos.slice(0, 6);

  const scrollTo = useCallback((dir) => {
    const el = containerRef.current;
    if (!el) return;
    const sections = el.querySelectorAll("[data-snap]");
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

  const stackPhotos = verticalSections[1] || [];
  const parallaxPhotos = verticalSections[2] || [];
  const floatingPhotos = verticalSections[3] || [];

  return (
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
      <div data-snap style={{ scrollSnapAlign: "start", height: "100vh", flexShrink: 0 }}>
        <HeroSection photos={resolvedHeroPhotos} title={title} />
      </div>

      {verticalSections[0]?.length ? (
        <div data-snap style={{ scrollSnapAlign: "start", height: "100vh", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center" }}>
          <FilmStrip photos={verticalSections[0]} onPhotoClick={onPhotoClick} />
        </div>
      ) : null}

      {stackPhotos.map((photo) => (
        <div key={photo.id} data-snap style={{ scrollSnapAlign: "start", height: "100vh", flexShrink: 0 }}>
          <StackStory photos={[photo]} onPhotoClick={onPhotoClick} />
        </div>
      ))}

      {parallaxPhotos.length ? (
        <div data-snap style={{ scrollSnapAlign: "start", height: "100vh", flexShrink: 0, overflow: "hidden" }}>
          <ParallaxLayers photos={parallaxPhotos} onPhotoClick={onPhotoClick} />
        </div>
      ) : null}

      {floatingPhotos.length ? (
        <div data-snap style={{ scrollSnapAlign: "start", height: "100vh", flexShrink: 0, overflow: "hidden" }}>
          <FloatingCloud photos={floatingPhotos} onPhotoClick={onPhotoClick} />
        </div>
      ) : null}

      {horizontal.length ? (
        <div data-snap style={{ scrollSnapAlign: "start", height: "100vh", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center" }}>
          <HorizontalJourney photos={horizontal} onPhotoClick={onPhotoClick} />
        </div>
      ) : null}

      {verticalSections[4]?.length ? (
        <div data-snap style={{ scrollSnapAlign: "start", height: "100vh", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CollageGrid photos={verticalSections[4]} onPhotoClick={onPhotoClick} />
        </div>
      ) : null}

      {photos.length ? (
        <div data-snap style={{ scrollSnapAlign: "start", height: "100vh", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CinematicViewer photos={photos.slice(0, 2)} onPhotoClick={onPhotoClick} />
        </div>
      ) : null}

      {photos.length ? (
        <div data-snap style={{ scrollSnapAlign: "start", height: "100vh", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MemoryWall photos={photos.slice(0, 12)} onPhotoClick={onPhotoClick} />
        </div>
      ) : null}

      <div data-snap style={{ scrollSnapAlign: "start", height: "100vh", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#000", color: "#fff" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", letterSpacing: "0.3em", textTransform: "uppercase" }}>
          more memories soon
        </p>
      </div>
    </div>
  );
}
