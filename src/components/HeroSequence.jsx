/**
 * HeroSequence.jsx — Sticky 300vh scroll orchestrator
 *
 * Animation timeline:
 *   0% – 40%   Hero scales 1 → 0.75, border-radius 0 → 40px, overlay 0 → 0.7
 *   0% – 5%    Pointer events disabled on canvas (no drag/hover glitches)
 *   30% – 80%  Custom SVG signature path draws left-to-right (pathLength 0 → 1)
 *
 * Note: uses motion/react (not framer-motion).
 * HeroSection is composed from the existing HeroPanels + MaskReveal components.
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
  const heroScale  = useTransform(scrollYProgress, [0, 0.4], [1, 0.75]);
  const heroRadius = useTransform(scrollYProgress, [0, 0.4], [0, 40]);
  const heroBorderRadius = useMotionTemplate`${heroRadius}px`;

  // ── 2. Disable pointer events on canvas once scrolling begins ───────────
  const heroPointerEvents = useTransform(
    scrollYProgress,
    [0, 0.05],
    ["auto", "none"]
  );

  // ── 3. Dark overlay fades in as hero shrinks ────────────────────────────
  const heroDarken = useTransform(scrollYProgress, [0, 0.4], [0, 0.7]);

  // ── 4. SVG signature path draw (pathLength 0 → 1) ──────────────────────
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
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            transformOrigin: "center center",
            backgroundColor: "#000000",
            zIndex: 10,
          }}
        >
          {/* Existing hero panels — unchanged */}
          <div
            style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}
          >
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
              background: "#000",
              zIndex: 30,
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* ── Custom SVG signature draw ───────────────────────────────── */}
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
          <svg
            viewBox="0 0 1884 679"
            style={{
              width: "90%",
              maxWidth: "1200px",
              filter: "drop-shadow(0 0 25px rgba(226, 54, 54, 0.8))",
            }}
          >
            <motion.path
              d="M578.218 80.0459L604.718 19.0459L567.718 0.545944L229.218 131.046V165.546L567.718 318.546L553.718 367.546L359.718 522.546L190.718 582.046L31.7177 626.546L0.717651 602.046L47.7177 547.046L292.718 422.546L529.218 345.046L631.218 331.046L621.218 406.546L676.218 388.046L737.218 318.546L712.718 406.546L959.718 284.046L890.218 406.546L800.718 569.546L723.218 653.046L659.718 677.546L604.718 653.046L608.718 592.046L659.718 533.046L723.218 475.546L843.218 422.546L967.718 357.546L1022.72 345.046C1013.38 353.213 997.518 373.246 1008.72 388.046C1019.92 402.846 1052.72 394.213 1067.72 388.046C1089.55 373.213 1133.22 341.046 1133.22 331.046M1133.22 331.046C1133.22 321.046 1128.88 302.213 1126.72 294.046C1125.7 289.213 1112.49 287.346 1067.72 318.546C1022.95 349.746 1092.73 339.879 1133.22 331.046ZM1133.22 367.546L1155.22 378.046C1202.88 342.546 1302.72 266.246 1320.72 245.046C1338.72 223.846 1375.88 192.879 1392.22 180.046L1436.72 116.546L1465.72 45.5459L1451.22 33.0459L1406.22 70.0459L1371.72 116.546L1347.22 147.546L1320.72 198.546L1306.22 245.046C1290.05 264.879 1258.12 309.846 1259.72 331.046C1261.32 352.246 1260.38 377.879 1259.72 388.046L1306.22 406.546L1451.22 367.546L1557.22 331.046L1689.72 284.046L1883.72 198.546"
              fill="transparent"
              stroke="#e23636"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength: signatureDraw }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
