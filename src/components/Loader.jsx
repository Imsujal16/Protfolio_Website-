/**
 * Loader.jsx — SVG Hole-Punch mask reveal (Awwwards / Lando Norris style).
 *
 * Phases:
 *   "loading"   → #f5f5f5 panel, "SJ" punches a transparent hole that 3D-flips
 *   "expanding" → hole scales to 250× revealing the hero underneath
 *   "done"      → component removed from DOM, onComplete() fires
 *
 * Two key adaptations from the reference code:
 *   1. Import from "motion/react" — this project uses Framer Motion v12
 *   2. Tailwind class names → inline styles (project uses vanilla CSS)
 *   3. SVG text font attributes added explicitly (classes don't apply inside <svg>)
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Loader({ onComplete }) {
  const [phase, setPhase] = useState("loading"); // "loading" | "expanding" | "done"

  useEffect(() => {
    // Phase 1: 3D flip for 2 seconds
    const timer1 = setTimeout(() => {
      setPhase("expanding");
    }, 2000);

    // Phase 2: massive scale zoom-through → done
    const timer2 = setTimeout(() => {
      setPhase("done");
      if (onComplete) onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          style={{
            position:       'fixed',
            inset:          0,
            zIndex:         9999,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            background:     'transparent',
            pointerEvents:  'none',
          }}
        >
          {/* ── SVG handles masking + zoom reveal ─────────────────── */}
          <svg
            style={{
              position: 'absolute',
              inset:    0,
              width:    '100%',
              height:   '100%',
            }}
          >
            <defs>
              <mask id="sj-mask">
                {/* White = solid background area */}
                <rect width="100%" height="100%" fill="white" />

                {/* Black = transparent hole shaped like "SJ" — we animate this */}
                <motion.text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="black"
                  style={{
                    fontSize:        '8rem',
                    fontFamily:      "'Clash Display', 'Inter', sans-serif",
                    fontWeight:      900,
                    fontStyle:       'italic',
                    letterSpacing:   '-0.04em',
                    transformOrigin: 'center center',
                  }}
                  initial={{ rotateY: 0, scale: 1 }}
                  animate={
                    phase === "loading"
                      ? { rotateY: [0, 180, 360] }          // 3D flip while loading
                      : { rotateY: 0, scale: 250 }           // zoom through on expand
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

            {/* The actual solid loading background — masked by the SJ hole */}
            <rect
              width="100%"
              height="100%"
              fill="#f5f5f5"
              mask="url(#sj-mask)"
            />
          </svg>

          {/* ── Bottom label — fades out when expansion starts ─────── */}
          <motion.div
            style={{
              position:  'absolute',
              bottom:    '2.5rem',
              left:      '50%',
              transform: 'translateX(-50%)',
              whiteSpace:'nowrap',
            }}
            animate={{ opacity: phase === "loading" ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{
                fontFamily:    "'Courier New', Courier, monospace",
                fontSize:      'clamp(0.65rem, 1.5vw, 0.8rem)',
                fontWeight:    700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color:         '#000',
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
