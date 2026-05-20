"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

export default function StackStory({ photos, onPhotoClick }) {
  if (photos.length === 0) return null;

  return photos.map((photo, i) => (
    <div
      key={photo.id}
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        position: "relative",
        cursor: "pointer",
      }}
      onClick={() => onPhotoClick?.(photo)}
    >
      <div
        style={{
          position: "relative",
          width: "auto",
          height: "min(85vh, 90vw)",
          aspectRatio: "9/16",
          maxHeight: "85vh",
        }}
      >
        <Image
          src={getPhotoUrl(photo.url, "full")}
          alt={photo.caption || `Memory ${i + 1}`}
          fill
          style={{ objectFit: "cover" }}
          priority={i < 3}
          sizes="50vw"
        />
        <div className="scroll-grain" />
      </div>

      {photo.caption ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.9 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom: "2.5rem",
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
    </div>
  ));
}
