"use client";
import { motion } from "framer-motion";
import TiltCard from "@/components/features/TiltCard";

const SPANS = [
  { col: 4, row: 3 }, { col: 3, row: 2 }, { col: 2, row: 2 }, { col: 5, row: 3 },
  { col: 3, row: 3 }, { col: 4, row: 2 }, { col: 2, row: 3 }, { col: 3, row: 2 },
  { col: 6, row: 3 }, { col: 2, row: 2 }, { col: 4, row: 4 }, { col: 3, row: 2 },
];

export default function CollageGrid({ photos }) {
  if (photos.length === 0) return null;

  return (
    <section className="content-section relative py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-12 auto-rows-[64px] gap-3">
          {photos.map((photo, i) => {
            const s = SPANS[i % SPANS.length];
            return (
              <TiltCard
                className="overflow-hidden rounded-xl"
                style={{ gridColumn: `span ${s.col}`, gridRow: `span ${s.row}` }}
              >
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
