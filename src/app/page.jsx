"use client";
import { useEffect, useState } from "react";
import Providers from "./providers";
import HeroSection from "@/components/sections/HeroSection";
import PhotoStrip from "@/components/features/PhotoStrip";
import ScrollSlider from "@/components/features/ScrollSlider";
import ScatterSection from "@/components/sections/ScatterSection";
import StoryViewer from "@/components/features/StoryViewer";
import MasonryGallery from "@/components/features/MasonryGallery";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
      .then((d) => setPhotos(shuffle(d.photos || [])))
      .catch(() => {});
  }, []);

  const n = photos.length;
  const strip   = photos.slice(0, Math.min(8, n));
  const slider  = photos.slice(8, Math.min(14, n));
  const scatter = photos.slice(14, Math.min(26, n));
  const story   = photos.slice(0, Math.min(10, n));
  const masonry = photos;

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
