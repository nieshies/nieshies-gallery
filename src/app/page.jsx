import Providers from "./providers";
import HeroSection from "@/components/sections/HeroSection";
import PhotoStrip from "@/components/features/PhotoStrip";
import ScrollSlider from "@/components/features/ScrollSlider";
import ScatterSection from "@/components/sections/ScatterSection";
import StoryViewer from "@/components/features/StoryViewer";
import MasonryGallery from "@/components/features/MasonryGallery";
import EndCard from "@/components/sections/EndCard";

const LABEL = {
  display: "block",
  textAlign: "center",
  fontSize: "9px",
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "rgba(244,140,54,0.55)",
  paddingTop: "3.5rem",
  paddingBottom: "0.65rem",
  userSelect: "none",
};

export default function Page() {
  return (
    <Providers>
      <div data-hero>
        <HeroSection />
      </div>

      <span style={LABEL}>moments</span>
      <div style={{ overflow: "hidden" }}>
        <PhotoStrip />
      </div>

      <span style={LABEL}>gallery</span>
      <ScrollSlider />

      <span style={LABEL}>scattered</span>
      <div style={{ overflow: "hidden" }}>
        <ScatterSection />
      </div>

      <span style={LABEL}>stories</span>
      <StoryViewer />

      <span style={LABEL}>dump</span>
      <MasonryGallery />

      <EndCard />
    </Providers>
  );
}
