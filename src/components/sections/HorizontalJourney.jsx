"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import TiltCard from "@/components/features/TiltCard";

export default function HorizontalJourney({ photos }) {
  const trackRef = useRef(null);

  if (photos.length === 0) return null;

  return (
    <section className="content-section relative py-16 overflow-hidden">
      <div className="overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing" ref={trackRef}>
        <div className="flex gap-8 px-8 pb-4" style={{ width: "max-content" }}>
          {photos.map((photo, i) => (
            <TiltCard
              className="flex-shrink-0 overflow-hidden rounded-2xl"
              style={{ width: "56vw", height: "74svh", aspectRatio: "3/4" }}
            >
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="w-full h-full"
            >
              <img
                src={`${photo.url}?t=${photo.uploadedAt}`}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
