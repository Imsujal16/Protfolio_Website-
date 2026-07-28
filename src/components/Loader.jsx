/**
 * Loader.jsx — Lando Norris-style full-screen intro sequence.
 *
 * Visual sequence:
 *   0ms     → full-screen #f5f5f5 cover mounts, SJ flips continuously (3D rotateY)
 *   ~2500ms → isLoading = false, AnimatePresence triggers exit
 *   exit    → panel slides up y: "-100%" over 800ms, cubic-bezier(0.76, 0, 0.24, 1)
 *   done    → AnimatePresence calls onExitComplete → onComplete() fires in App
 *
 * Imports from "motion/react" — Framer Motion v12 package name in this project.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Loader({ onComplete }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isLoading && (
        <motion.div
          key="loader"
          exit={{
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          style={{
            position:       'fixed',
            inset:          0,
            zIndex:         9999,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            backgroundColor:'#f5f5f5',
            color:          '#000',
            overflow:       'hidden',
          }}
        >
          {/* ── Center "SJ" with continuous 3D flip ── */}
          <motion.div
            animate={{ rotateY: [0, 180, 360] }}
            transition={{
              duration: 1.5,
              repeat:   Infinity,
              ease:     "easeInOut",
            }}
            style={{
              transformStyle: 'preserve-3d',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
          >
            <h1
              style={{
                fontFamily:    "'Clash Display', 'Inter', sans-serif",
                fontSize:      'clamp(4rem, 12vw, 7rem)',
                fontWeight:    900,
                fontStyle:     'italic',
                letterSpacing: '-0.04em',
                lineHeight:    1,
                color:         '#000',
                mixBlendMode:  'difference',
                userSelect:    'none',
              }}
            >
              SJ
            </h1>
          </motion.div>

          {/* ── Bottom "INITIALIZING SUJAL" pulsing text ── */}
          <div
            style={{
              position:  'absolute',
              bottom:    '2.5rem',
              left:      '50%',
              transform: 'translateX(-50%)',
              whiteSpace:'nowrap',
            }}
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
