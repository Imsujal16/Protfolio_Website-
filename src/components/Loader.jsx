/**
 * Loader.jsx — SVG Hole-Punch mask reveal + re-render kill switch
 *
 * Critical fixes baked in:
 *  • hasLoaderRun (module-scoped) — survives React re-renders, resets on F5.
 *    Prevents scroll-triggered re-mounts from playing the animation backward.
 *  • useLayoutEffect  — disables scroll restoration & locks body BEFORE paint.
 *  • Kill switch      — returns null after completion so Framer has no tree to rewind.
 *
 * Timeline:
 *   0ms    → loading phase, SJ 3D-flips
 *   2000ms → expanding phase: scale 1 → 1500, cubic-bezier(0.76,0,0.24,1)
 *   2700ms → parent opacity fades out (delay 0.7s) — melts edge artifacts
 *   3200ms → done, onComplete() fires
 */

import { useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getLenis } from "../hooks/useLenis";

// Lives outside React — survives re-renders, resets on hard browser refresh (F5).
let hasLoaderRun = false;

export default function Loader({ onComplete }) {
  const [phase, setPhase] = useState(hasLoaderRun ? "done" : "loading");

  // Runs synchronously BEFORE the browser paints the first frame
  useLayoutEffect(() => {
    if (hasLoaderRun) return; // Already ran this session — skip entirely

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // Stop Lenis immediately so it can't fight the scroll lock
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      lenis.stop();
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      if (getLenis()) getLenis().start();
    };
  }, []);

  useEffect(() => {
    // Re-render triggered by scroll spy? Instantly unlock and bail out.
    if (hasLoaderRun) {
      if (onComplete) onComplete();
      return;
    }

    const timer1 = setTimeout(() => setPhase("expanding"), 2000);
    const timer2 = setTimeout(() => {
      hasLoaderRun = true; // Mark permanently complete
      setPhase("done");
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  // KILL SWITCH: remove the entire Framer tree after completion so it can't rewind
  if (hasLoaderRun && phase === "done") return null;

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            pointerEvents: "none",
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "expanding" ? 0 : 1 }}
          transition={{ delay: 0.7, duration: 0.5, ease: "easeInOut" }}
        >
          {/* ── SVG hole-punch mask ─────────────────────────────────── */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <defs>
              <mask id="sj-mask">
                <rect width="100%" height="100%" fill="white" />
                {/* Black region = transparent hole that swallows the panel */}
                <motion.text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="black"
                  style={{
                    fontSize: "8rem",
                    fontFamily: "'Clash Display', 'Inter', sans-serif",
                    fontWeight: 900,
                    fontStyle: "italic",
                    letterSpacing: "-0.04em",
                    transformOrigin: "center center",
                  }}
                  initial={{ rotateY: 0, scale: 1 }}
                  animate={
                    phase === "loading"
                      ? { rotateY: [0, 180, 360] }
                      : { rotateY: 0, scale: 1500 }
                  }
                  transition={
                    phase === "loading"
                      ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 1.2, ease: [0.76, 0, 0.24, 1] }
                  }
                >
                  SJ
                </motion.text>
              </mask>
            </defs>

            <rect
              width="100%"
              height="100%"
              fill="#f5f5f5"
              mask="url(#sj-mask)"
            />
          </svg>

          {/* ── Bottom label ─────────────────────────────────────────── */}
          <motion.div
            style={{
              position: "absolute",
              bottom: "2.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
            animate={{ opacity: phase === "loading" ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "clamp(0.65rem, 1.5vw, 0.8rem)",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#000",
              }}
            >
              Initializing Sujal
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
