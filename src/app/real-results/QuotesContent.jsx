"use client";
import usePhotos from "@/hooks/usePhotos";
import QuotesWall from "@/components/features/QuotesWall";
import Section from "@/components/ui/Section";
import { motion } from "framer-motion";

export default function QuotesContent() {
  const { photos } = usePhotos();

  return (
    <div className="space-y-6">
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-a3 text-xs font-display uppercase tracking-[0.2em] mb-2">
            Words That Move
          </p>
          <h1 className="m-0 font-display uppercase text-[clamp(2.2rem,6vw,4.5rem)] leading-[.92] text-white">
            Real <span className="text-a1">Results</span>
          </h1>
          <p className="text-white/50 mt-3 max-w-xl">
            Wisdom, inspiration, and truth — handpicked to spark your next big idea.
          </p>
        </motion.div>
      </Section>

      <Section className="!border-a1/30">
        <QuotesWall photos={photos} />
      </Section>
    </div>
  );
}
