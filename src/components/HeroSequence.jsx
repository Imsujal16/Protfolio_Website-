/**
 * HeroSequence.jsx — Sticky Scroll Sequence
 *
 * Wraps the existing hero panels (DesignerPanel, MaskReveal, CoderPanel)
 * inside a 300vh scroll container and orchestrates:
 *
 *   0% – 40%   → Hero scales 1 → 0.75, borderRadius 0 → 40px, overlay 0 → 0.6
 *   0% – 5%    → Pointer events disabled so canvas drag doesn't glitch
 *   30% – 80%  → /signature.png revealed left-to-right via clip-path wipe
 *
 * Note: uses Framer Motion only (no SVG pathLength) because the signature
 * is a raster PNG. The wipe is driven by useMotionTemplate → clip-path.
 */

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "motion/react";
import MaskReveal from "./MaskReveal";
import { DesignerPanel, CoderPanel } from "./HeroPanels";

export default function HeroSequence() {
  const containerRef = useRef(null);

  // Scroll progress across the full 300vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // ── 1. Hero card shrink ─────────────────────────────────────────────────
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.75]);
  const heroRadius = useTransform(scrollYProgress, [0, 0.4], [0, 40]);
  const heroBorderRadius = useMotionTemplate`${heroRadius}px`;

  // ── 2. Disable pointer events on canvas once scrolling begins ───────────
  const heroPointerEvents = useTransform(
    scrollYProgress,
    [0, 0.05],
    ["auto", "none"]
  );

  // ── 3. Dark overlay on the hero card ────────────────────────────────────
  const heroDarken = useTransform(scrollYProgress, [0, 0.4], [0, 0.6]);

  // ── 4. Clip-path wipe for the signature PNG ─────────────────────────────
  //   scrollYProgress 0.3 → inset right = 100% (fully hidden)
  //   scrollYProgress 0.8 → inset right = 0%   (fully revealed)
  const clipInset = useTransform(scrollYProgress, [0.3, 0.8], [100, 0]);
  const clipPathTemplate = useMotionTemplate`inset(0 ${clipInset}% 0 0)`;

  return (
    // The 300vh scroll space — background matches the loader / site palette
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "300vh", background: "#0a0a0a" }}
    >
      {/* Sticky viewport — everything lives here while the user scrolls */}
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* ── Shrinking hero card ─────────────────────────────────────── */}
        <motion.div
          style={{
            scale: heroScale,
            borderRadius: heroBorderRadius,
            pointerEvents: heroPointerEvents,
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            transformOrigin: "center center",
            backgroundColor: "#000000",
          }}
        >
          {/* Existing hero panels — exact same as before */}
          <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
            <DesignerPanel />
            <MaskReveal />
            <CoderPanel />
          </div>

          {/* Dark overlay that fades in as hero shrinks */}
          <motion.div
            style={{
              opacity: heroDarken,
              position: "absolute",
              inset: 0,
              background: "#000",
              zIndex: 30,
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* ── Signature PNG wipe ──────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <motion.img
            src="/signature.png"
            alt="Sujal's signature"
            style={{
              clipPath: clipPathTemplate,
              WebkitClipPath: clipPathTemplate,
              width: "90%",
              maxWidth: "800px",
              objectFit: "contain",
              filter: "drop-shadow(0 0 20px rgba(226, 54, 54, 0.7))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
