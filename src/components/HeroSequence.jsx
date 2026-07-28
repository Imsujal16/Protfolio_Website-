/**
 * HeroSequence.jsx — Sticky 300vh scroll orchestrator
 *
 * Animation timeline:
 *   0%  – 40%   Hero scales 1 → 0.8, border-radius 0 → 40px, overlay 0 → 0.85
 *   0%  – 5%    Pointer events disabled on canvas (prevents drag/hover glitches)
 *   30% – 80%   Both SVG signature paths draw left-to-right (pathLength 0 → 1)
 *
 * Note: uses motion/react (not framer-motion). All layout is inline styles — 
 * Tailwind is not fully configured in this project. Hero is composed from the 
 * existing DesignerPanel + MaskReveal + CoderPanel components.
 */

import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "motion/react";
import MaskReveal from "./MaskReveal";
import { DesignerPanel, CoderPanel } from "./HeroPanels";

export default function HeroSequence() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // ── 1. Hero card shrink ─────────────────────────────────────────────────
  const heroScale  = useTransform(scrollYProgress, [0, 0.4], [1, 0.8]);
  const heroRadius = useTransform(scrollYProgress, [0, 0.4], [0, 40]);
  const heroBorderRadius = useMotionTemplate`${heroRadius}px`;

  // ── 2. Disable pointer events on canvas once scrolling begins ───────────
  const heroPointerEvents = useTransform(
    scrollYProgress,
    [0, 0.05],
    ["auto", "none"]
  );

  // ── 3. Dark overlay fades in as hero shrinks ────────────────────────────
  const heroDarken = useTransform(scrollYProgress, [0, 0.4], [0, 0.85]);

  // ── 4. SVG signature draw (pathLength 0 → 1) ───────────────────────────
  const signatureDraw = useTransform(scrollYProgress, [0.3, 0.8], [0, 1]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "300vh", background: "#0a0a0a" }}
    >
      {/* Sticky viewport — holds everything while the user scrolls */}
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
            transformOrigin: "center center",
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            backgroundColor: "#000000",
            zIndex: 10,
          }}
        >
          {/* Existing hero panels — unchanged */}
          <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
            <DesignerPanel />
            <MaskReveal />
            <CoderPanel />
          </div>

          {/* Dark overlay fades in as hero shrinks */}
          <motion.div
            style={{
              opacity: heroDarken,
              position: "absolute",
              inset: 0,
              background: "#070707",
              zIndex: 30,
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* ── Multi-path SVG signature overlay ───────────────────────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            padding: "0 1.5rem",
          }}
        >
          <svg
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", maxWidth: "900px", maxHeight: "50vh" }}
          >
            <defs>
              {/* Radioactive Spidey Glow Filter */}
              <filter id="spidey-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8"  result="blur1" />
                <feGaussianBlur stdDeviation="15" result="blur2" />
                <feGaussianBlur stdDeviation="25" result="blur3" />
                <feMerge>
                  <feMergeNode in="blur3" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* MAIN SIGNATURE PATH */}
            <motion.path
              d="M90,500 C130,420 180,360 260,380 C330,398 350,470 300,520 C260,558 200,540 190,470 C182,415 230,360 300,340 C400,310 480,360 460,440 C445,500 380,530 340,470 C310,425 350,370 420,360 C520,345 620,400 640,480 C655,540 600,580 550,540 C510,508 530,450 590,430 C680,400 780,440 800,520 C815,580 770,620 720,590 C680,565 690,510 740,480 C830,425 940,450 970,530 C985,570 960,600 930,580 C905,563 915,525 950,500 C1010,458 1090,470 1120,410 C1140,368 1130,320 1090,300"
              fill="transparent"
              stroke="#e23636"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#spidey-glow)"
              style={{ pathLength: signatureDraw }}
            />

            {/* DOT / SPIDER DETAIL PATH */}
            <motion.path
              d="M965,235 C968,228 976,228 979,235 C982,242 974,248 968,244 C964,241 963,238 965,235"
              fill="transparent"
              stroke="#e23636"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#spidey-glow)"
              style={{ pathLength: signatureDraw }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
