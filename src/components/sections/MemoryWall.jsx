"use client";
import { motion } from "framer-motion";
import TiltCard from "@/components/features/TiltCard";

export default function MemoryWall({ photos }) {
  if (photos.length === 0) return null;

  return (
    <section className="content-section relative py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid auto-rows-[64px] grid-cols-10 gap-2">
          {photos.map((photo, i) => (
            <TiltCard
              className="overflow-hidden rounded-lg"
              style={{ gridRow: `span ${i % 3 === 0 ? 2 : 1}`, gridColumn: `span ${i % 4 === 0 ? 2 : 1}` }}
            >
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              className="w-full h-full"
            >
              <img
                src={`${photo.url}?t=${photo.uploadedAt}`}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
