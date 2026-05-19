"use client";
import { motion } from "framer-motion";
import TiltCard from "@/components/features/TiltCard";

export default function StackStory({ photos }) {
  if (photos.length === 0) return null;

  return (
    <section className="content-section relative py-24 overflow-hidden">
      <div className="flex flex-col items-center gap-6 perspective-[1000px]">
        {photos.map((photo, i) => (
          <TiltCard
            className="overflow-hidden rounded-2xl shadow-xl"
            style={{ width: "min(600px, 88vw)", aspectRatio: "3/4" }}
          >
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, rotateX: -10, y: 40 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="w-full h-full"
            style={{
              transform: `rotateX(${2 * (photos.length - i)}deg)`,
              zIndex: photos.length - i,
            }}
          >
            <img
              src={`${photo.url}?t=${photo.uploadedAt}`}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </motion.div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
