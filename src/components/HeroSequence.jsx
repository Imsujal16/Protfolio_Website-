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
              d="M578.218 80.0459
C582.635 69.879, 606.468 32.296, 604.718 19.046
C602.968 5.796, 630.301 -18.121, 567.718 0.546
C505.135 19.213, 285.635 103.546, 229.218 131.046
C172.801 158.546, 172.801 134.296, 229.218 165.546
C285.635 196.796, 513.635 284.879, 567.718 318.546
C621.801 352.213, 588.385 333.546, 553.718 367.546
C519.051 401.546, 420.218 486.796, 359.718 522.546
C299.218 558.296, 245.385 564.713, 190.718 582.046
C136.051 599.379, 63.384 623.213, 31.718 626.546
C0.051 629.879, -1.949 615.296, 0.718 602.046
C3.384 588.796, -0.949 576.963, 47.718 547.046
C96.384 517.129, 212.468 456.213, 292.718 422.546
C372.968 388.879, 472.801 360.296, 529.218 345.046
C585.635 329.796, 615.885 320.796, 631.218 331.046
C646.551 341.296, 613.718 397.046, 621.218 406.546
C628.718 416.046, 656.885 402.713, 676.218 388.046
C695.551 373.379, 731.135 315.463, 737.218 318.546
C743.301 321.629, 675.635 412.296, 712.718 406.546
C749.801 400.796, 930.135 284.046, 959.718 284.046
C989.301 284.046, 916.718 358.963, 890.218 406.546
C863.718 454.129, 828.551 528.463, 800.718 569.546
C772.885 610.629, 746.718 635.046, 723.218 653.046
C699.718 671.046, 679.468 677.546, 659.718 677.546
C639.968 677.546, 613.218 667.296, 604.718 653.046
C596.218 638.796, 599.551 612.046, 608.718 592.046
C617.885 572.046, 640.635 552.463, 659.718 533.046
C678.801 513.629, 692.635 493.963, 723.218 475.546
C753.801 457.129, 802.468 442.213, 843.218 422.546
C883.968 402.879, 937.801 370.463, 967.718 357.546
C997.635 344.629, 1013.553 347.129, 1022.720 345.046"
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
