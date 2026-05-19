"use client";
import { useEffect, useRef, useCallback } from "react";
import { useGame } from "@/lib/ExperienceContext";

const colors = ["#ff3af2", "#00f5d4", "#ffe600", "#7b2fff", "#ff6b35"];

function ParticleBurst({ x, y, container }) {
  const count = 30;
  const particles = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const size = 3 + Math.random() * 6;
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const velocity = 60 + Math.random() * 120;
    const color = colors[Math.floor(Math.random() * colors.length)];
    el.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      pointer-events: none;
      z-index: 9999;
      box-shadow: 0 0 6px ${color};
      transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    `;
    document.body.appendChild(el);
    particles.push({ el, angle, velocity, start: performance.now() });
  }

  const anim = () => {
    const now = performance.now();
    particles.forEach((p) => {
      const dt = (now - p.start) / 1000;
      const life = Math.max(0, 1 - dt / 0.8);
      if (life <= 0) {
        p.el.remove();
        return;
      }
      const dist = p.velocity * dt;
      const gravity = 120 * dt * dt;
      p.el.style.transform = `translate(${Math.cos(p.angle) * dist}px, ${Math.sin(p.angle) * dist + gravity}px) scale(${life})`;
      p.el.style.opacity = life;
    });
    if (particles.some((p) => p.el.parentNode)) {
      requestAnimationFrame(anim);
    }
  };
  requestAnimationFrame(anim);
}

function FloatText({ x, y, text }) {
  const el = document.createElement("div");
  const color = colors[Math.floor(Math.random() * colors.length)];
  el.textContent = text;
  el.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    color: ${color};
    font-family: Outfit, sans-serif;
    font-weight: 900;
    font-size: ${14 + Math.random() * 18}px;
    pointer-events: none;
    z-index: 9999;
    text-shadow: 0 0 10px ${color};
    transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = `translateY(-${60 + Math.random() * 80}px)`;
    el.style.opacity = "0";
  });
  setTimeout(() => el.remove(), 1500);
}

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export default function InteractiveEffects() {
  const containerRef = useRef(null);
  const lastScrollDispatch = useRef(0);
  const konamiBuffer = useRef([]);
  const konamiUnlocked = useRef(false);
  const { dispatch, playSound } = useGame();

  useEffect(() => {
    const handleScroll = () => {
      const depth = window.scrollY;
      if (depth >= 5000 && lastScrollDispatch.current < 5000) {
        lastScrollDispatch.current = 5000;
        dispatch("scroll_5000", depth);
      } else if (depth >= 1000 && lastScrollDispatch.current < 1000) {
        lastScrollDispatch.current = 1000;
        dispatch("scroll_1000", depth);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dispatch]);

  const handleClick = useCallback((e) => {
    const target = e.target;
    if (target.closest("a") || target.closest("button") || target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA") return;
    ParticleBurst({ x: e.clientX, y: e.clientY });
    playSound("pop");
    dispatch("click");
    const words = ["✨", "★", "♥", "•", "⚡", "∞", "◆", "✦", "✧", "◎"];
    if (Math.random() > 0.6) {
      FloatText({ x: e.clientX, y: e.clientY, text: words[Math.floor(Math.random() * words.length)] });
    }
  }, [dispatch, playSound]);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [handleClick]);

  useEffect(() => {
    if (konamiUnlocked.current) return;
    const handleKey = (e) => {
      konamiBuffer.current.push(e.key);
      konamiBuffer.current = konamiBuffer.current.slice(-10);
      if (konamiBuffer.current.length === 10 && konamiBuffer.current.every((k, i) => k === KONAMI[i])) {
        konamiUnlocked.current = true;
        dispatch("milestone");
        playSound("fanfare");
        document.body.style.filter = "hue-rotate(180deg) invert(1)";
        document.body.style.transition = "filter 0.8s ease";
        setTimeout(() => {
          document.body.style.filter = "";
        }, 5000);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dispatch, playSound]);

  return null;
}
