/**
 * Loader.jsx — SVG Hole-Punch mask reveal, dissolve fix.
 *
 * Fix vs previous version:
 *   1. scale 250 → 1500  (pushes hole way past viewport corners)
 *   2. Parent opacity: 1 → 0 with delay: 0.7, duration: 0.5
 *      (melts letter-edge artifacts before unmount timer fires)
 *
 * Timeline:
 *   0ms    → loading phase, SJ 3D-flips
 *   2000ms → expanding phase:
 *              • SJ scale 1→1500 over 1.2s, cubic-bezier(0.76,0,0.24,1)
 *              • label fades out 0.3s
 *              • container fades out 0.5s (delay 0.7s → starts at 2700ms)
 *   3200ms → done, onComplete() fires
 */

import { useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getLenis } from "../hooks/useLenis"; // Import getLenis to pause/reset it

export default function Loader({ onComplete }) {
  const [phase, setPhase] = useState("loading");

  // THE FIX: useLayoutEffect runs synchronously BEFORE the browser paints
  useLayoutEffect(() => {
    // 1. Disable browser's native scroll memory
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // 2. Instantly snap to the top of the page
    window.scrollTo(0, 0);
    
    // Optional: Stop/reset Lenis smooth scrolling immediately
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      lenis.stop();
    }

    // 3. Lock body scrolling while the loader is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 4. Unlock scrolling when the component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
      if (getLenis()) getLenis().start();
    };
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase("expanding"), 2000);
    const timer2 = setTimeout(() => {
      setPhase("done");
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
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
          /* THE FIX: fade the whole overlay out right at the end of the zoom */
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "expanding" ? 0 : 1 }}
          transition={{ delay: 0.7, duration: 0.5, ease: "easeInOut" }}
        >
          {/* ── SVG mask ─────────────────────────────────────────── */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <defs>
              <mask id="sj-mask">
                <rect width="100%" height="100%" fill="white" />

                {/* Black = transparent hole. Scale this to swallow the panel. */}
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
                      ? { rotateY: [0, 180, 360] }
                      : { rotateY: 0, scale: 1500 }   /* THE FIX: 1500× */
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

            <rect width="100%" height="100%" fill="#f5f5f5" mask="url(#sj-mask)" />
          </svg>

          {/* ── Bottom label ──────────────────────────────────────── */}
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
