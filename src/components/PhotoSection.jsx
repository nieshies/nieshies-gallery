"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

export default function PhotoSection({ photo, index, total }) {
  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        scrollSnapAlign: "start",
        flexShrink: 0,
        background: "#000",
        overflow: "hidden",
      }}
    >
      <Image
        src={getPhotoUrl(photo.url, "full")}
        alt={photo.caption || `Memory ${index + 1}`}
        fill
        priority={index < 3}
        style={{ objectFit: "cover", opacity: 0.88 }}
        sizes="100vw"
      />
      <div className="scroll-grain" />

      {photo.caption ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.9 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom: "2.5rem",
            left: "2.5rem",
            color: "#fff",
            fontSize: "0.88rem",
            fontWeight: 300,
            letterSpacing: "0.04em",
            textShadow: "0 1px 16px rgba(0,0,0,0.95)",
            margin: 0,
            maxWidth: "55%",
            zIndex: 2,
          }}
        >
          {photo.caption}
        </motion.p>
      ) : null}

      <p
        style={{
          position: "absolute",
          bottom: "2.5rem",
          right: "2.5rem",
          color: "rgba(255,255,255,0.22)",
          fontSize: "0.72rem",
          letterSpacing: "0.18em",
          margin: 0,
          zIndex: 2,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
    </section>
  );
}
