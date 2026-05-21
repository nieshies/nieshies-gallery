"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/", label: "HOME" },
  { href: "/amnie", label: "AMNIE" },
  { href: "/family", label: "FAMILY" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Non-home pages: always show — no DOM query (pathname updates before
    // DOM commits, so querying [data-hero] here would find the old page's element)
    if (pathname !== "/") {
      setNavVisible(true);
      return;
    }
    // Home page only: hide nav while the hero section is in view
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      setNavVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setNavVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  const desktopVisible = loaded && navVisible;

  return (
    <>
      <nav
        className={`fixed top-6 right-6 z-40 hidden lg:block transition-all duration-500 ease-out ${desktopVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
        style={{ pointerEvents: desktopVisible ? "auto" : "none" }}
      >
        <div className="glass-panel shadow-glass rounded-2xl py-4 px-3">
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
                    isActive ? "text-accent" : "text-white/40 hover:text-white/70"
                  }`}
                  style={{ background: isActive ? "rgba(244,140,54,0.1)" : "transparent" }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={`fixed top-4 left-4 z-50 lg:hidden glass-panel shadow-glass rounded-xl w-10 h-10 flex items-center justify-center dotnav-mobile ${loaded ? "visible" : ""}`}
      >
        <div className="space-y-1">
          <span className={`block w-4 h-[1.5px] bg-white/60 transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
          <span className={`block w-4 h-[1.5px] bg-white/60 transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-4 h-[1.5px] bg-white/60 transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 bottom-0 w-56 glass-panel shadow-glass p-6 pt-16"
            >
              <div className="space-y-2">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2 rounded-xl text-sm font-display font-bold uppercase tracking-[0.18em] transition-all ${
                        isActive ? "text-accent bg-accent-dim" : "text-white/50 hover:text-white/80"
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
