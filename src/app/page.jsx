"use client";
import { useEffect, useState } from "react";
import Providers from "./providers";
import HeroSection from "@/components/sections/HeroSection";
import PhotoStrip from "@/components/features/PhotoStrip";
import ScrollSlider from "@/components/features/ScrollSlider";
import ScatterSection from "@/components/sections/ScatterSection";
import StoryViewer from "@/components/features/StoryViewer";
import MasonryGallery from "@/components/features/MasonryGallery";

const LABEL = {
  display: "block",
  textAlign: "center",
  fontSize: "9px",
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "rgba(244,140,54,0.55)",
  paddingTop: "3.5rem",
  paddingBottom: "0.75rem",
  userSelect: "none",
};

const SEC = { paddingBottom: "3rem" };

export default function Page() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetch("/api/photos?page=home")
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {});
  }, []);

  // Distribute photos across sections — each section gets a different slice
  // so every photo appears somewhere without redundancy
  const n       = photos.length;
  const strip   = photos.slice(0, Math.min(8, n));            // strip: first 8
  const slider  = photos.slice(8, Math.min(16, n));           // slider: next 8
  const scatter = photos.slice(16, Math.min(28, n));          // scatter: next 12
  const story   = photos.slice(0, n);                         // story: all (shows 1 at a time)
  const masonry = photos.slice(0, n);                         // masonry: full grid, lazy

  return (
    <Providers>
      <div data-hero>
        <HeroSection />
      </div>

      {strip.length > 0 && (
        <div style={SEC}>
          <span style={LABEL}>moments</span>
          <div style={{ overflow: "hidden" }}>
            <PhotoStrip photos={strip} />
          </div>
        </div>
      )}

      {slider.length > 0 && (
        <div style={SEC}>
          <span style={LABEL}>gallery</span>
          <ScrollSlider photos={slider} />
        </div>
      )}

      {scatter.length > 0 && (
        <div style={SEC}>
          <span style={LABEL}>scattered</span>
          <div style={{ overflow: "hidden" }}>
            <ScatterSection photos={scatter} />
          </div>
        </div>
      )}

      {story.length > 0 && (
        <div style={{ ...SEC, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 1rem 3rem" }}>
          <span style={LABEL}>stories</span>
          <StoryViewer photos={story} />
        </div>
      )}

      {masonry.length > 0 && (
        <div style={{ padding: "0 0.75rem 5rem" }}>
          <span style={LABEL}>memories</span>
          <MasonryGallery photos={masonry} />
        </div>
      )}
    </Providers>
  );
}
