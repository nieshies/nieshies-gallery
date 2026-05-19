"use client";
import { motion } from "framer-motion";
import useInView from "@/lib/useInView";
import PhotoCard from "@/components/features/PhotoCard";

export default function CinematicViewer({ photos, onPhotoClick }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  if (photos.length === 0) return null;
  const photo = photos[0];

  return (
    <section
      ref={ref}
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "min(56rem, 88vw)" }}
      >
        <PhotoCard photo={photo} onClick={onPhotoClick} aspect="16/10" tilt={false} />
      </motion.div>
    </section>
  );
}
