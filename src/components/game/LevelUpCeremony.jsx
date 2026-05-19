"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/ExperienceContext";

const COLORS = ["#f48c36", "#ffb347", "#ffd700", "#e67e22", "#f39c12", "#ff6b35", "#d35400"];

function ConfettiCanvas({ level }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    let animId;

    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      r: 2 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      life: 1,
    }));

    const gravity = 0.08;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      pieces.forEach((p) => {
        p.x += p.vx;
        p.vy += gravity;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life -= 0.003;
        if (p.life <= 0) return;
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      });
      if (alive) animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => { if (animId) cancelAnimationFrame(animId); };
  }, [level]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
    />
  );
}

export default function LevelUpCeremony() {
  const { level, playSound } = useGame();
  const [show, setShow] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(null);
  const prevRef = useRef(level);

  useEffect(() => {
    if (level > prevRef.current && prevRef.current > 0) {
      setDisplayLevel(level);
      setShow(true);
      playSound("fanfare");
      const t = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(t);
    }
    prevRef.current = level;
  }, [level, playSound]);

  if (!displayLevel) return null;

  return (
    <AnimatePresence>
      {show && (
        <>
          <ConfettiCanvas level={displayLevel} />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-[99] flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <motion.p
                className="text-[10px] font-display uppercase tracking-[0.4em] mb-3"
                style={{ color: "rgba(244,140,54,0.5)" }}
              >
                Level Up
              </motion.p>
              <motion.p
                className="font-display font-black text-[clamp(4rem,15vw,10rem)] leading-none"
                style={{
                  background: "linear-gradient(135deg, #f48c36, #ffb347, #ffd700)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.3 }}
              >
                {displayLevel}
              </motion.p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
