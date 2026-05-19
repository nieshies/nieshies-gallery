"use client";
import { motion } from "framer-motion";
import TiltCard from "@/components/features/TiltCard";

export default function MasonryGrid({ photos, onPhotoClick }) {
  if (photos.length === 0) return null;

  return (
    <section className="masonry-grid max-w-7xl mx-auto px-4 py-12 columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {photos.map((photo, i) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ delay: (i % 12) * 0.03, duration: 0.5 }}
          className="break-inside-avoid"
        >
          <TiltCard
            className="overflow-hidden rounded-xl cursor-pointer"
            data-photo-id={photo.id}
            onClick={() => onPhotoClick?.(photo)}
          >
            <img
              src={`${photo.url}?t=${photo.uploadedAt}`}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </TiltCard>
        </motion.div>
      ))}
    </section>
  );
}
