"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { getPhotoUrl } from "@/utils/photo";

const positions = [
  { top: "6%",  left: "4%",  width: 270, height: 360, rotate: -5,  floatDur: 7.0, delay: 0    },
  { top: "4%",  left: "60%", width: 230, height: 300, rotate:  3,  floatDur: 8.5, delay: 0.15 },
  { top: "22%", left: "26%", width: 195, height: 260, rotate: -2,  floatDur: 6.5, delay: 0.08 },
  { top: "54%", left: "6%",  width: 250, height: 330, rotate:  6,  floatDur: 9.0, delay: 0.22 },
  { top: "50%", left: "54%", width: 290, height: 380, rotate: -4,  floatDur: 7.8, delay: 0.10 },
  { top: "28%", left: "76%", width: 175, height: 240, rotate:  7,  floatDur: 8.2, delay: 0.18 },
];

export default function ScatteredHero({ photos }) {
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
      {photos.slice(0, 6).map((photo, i) => {
        const p = positions[i];
        return (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{
              opacity: 0.82,
              scale: 1,
              y: [0, -14, 0],
            }}
            transition={{
              opacity: { delay: p.delay, duration: 1.4, ease: "easeOut" },
              scale:   { delay: p.delay, duration: 1.4, ease: "easeOut" },
              y: {
                delay: p.delay + 1.2,
                duration: p.floatDur,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            }}
            style={{
              position: "absolute",
              top: p.top,
              left: p.left,
              width: p.width,
              height: p.height,
              transform: `rotate(${p.rotate}deg)`,
              borderRadius: 3,
              overflow: "hidden",
              zIndex: 1,
            }}
          >
            <Image
              src={getPhotoUrl(photo.url, "thumb")}
              alt={photo.caption || `Memory ${i + 1}`}
              fill
              style={{ objectFit: "cover" }}
              sizes="300px"
            />
          </motion.div>
        );
      })}

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color: "#fff",
            fontSize: "clamp(2.4rem, 7vw, 5.5rem)",
            fontWeight: 300,
            letterSpacing: "0.07em",
            margin: 0,
            textShadow: "0 0 60px rgba(0,0,0,1), 0 2px 20px rgba(0,0,0,0.9)",
          }}
        >
          nieshies&apos; dump
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.8, duration: 0.9 }}
          style={{
            color: "#fff",
            fontSize: "0.72rem",
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            margin: "1.5rem 0 0",
          }}
        >
          scroll
        </motion.p>

        <motion.div
          animate={{ y: [0, 9, 0] }}
          transition={{ delay: 2.2, duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ color: "rgba(255,255,255,0.3)", fontSize: "1.1rem", marginTop: "0.4rem" }}
        >
          ↓
        </motion.div>
      </div>
    </section>
  );
}
