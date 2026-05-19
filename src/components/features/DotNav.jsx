"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "HOME" },
  { href: "/products", label: "GALLERY" },
  { href: "/amnie", label: "AMNIE" },
  { href: "/family", label: "FAMILY" },
];

export default function DotNav() {
  const pathname = usePathname();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleMouse = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: scrolled ? 1 : 0, x: scrolled ? 0 : -20 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        onMouseMove={handleMouse}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block pointer-events-none"
        style={{ pointerEvents: scrolled ? "auto" : "none" }}
      >
        <div
          className="glass-panel shadow-glass rounded-2xl py-4 px-3 relative overflow-hidden"
          style={{
            background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(244,140,54,0.08), transparent 60%)`,
          }}
        >
          <div className="mb-4 px-1">
            <p className="text-[10px] font-display font-bold uppercase tracking-[0.24em] text-accent">
              nieshies
            </p>
            <div className="w-6 h-[1px] bg-accent/40 mt-1.5 mx-auto" />
          </div>

          <div className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-2.5 py-1.5 rounded-lg text-[11px] font-display font-bold uppercase tracking-[0.18em] transition-all duration-200 ${
                    isActive
                      ? "text-accent"
                      : "text-white/40 hover:text-white/70"
                  }`}
                  style={{
                    background: isActive ? "rgba(244,140,54,0.1)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>

      <motion.button
        onClick={() => setMobileOpen(!mobileOpen)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: scrolled ? 1 : 0, y: scrolled ? 0 : -10 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 left-4 z-50 lg:hidden glass-panel shadow-glass rounded-xl w-10 h-10 flex items-center justify-center"
      >
        <div className="space-y-1">
          <span className={`block w-4 h-[1.5px] bg-white/60 transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
          <span className={`block w-4 h-[1.5px] bg-white/60 transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-4 h-[1.5px] bg-white/60 transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
        </div>
      </motion.button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
            <motion.nav className="absolute left-0 top-0 bottom-0 w-56 glass-panel shadow-glass p-6 pt-16">
              <div className="space-y-2">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2 rounded-xl text-sm font-display font-bold uppercase tracking-[0.18em] transition-all ${
                        isActive
                          ? "text-accent bg-accent-dim"
                          : "text-white/50 hover:text-white/80"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
