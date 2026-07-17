/**
 * useAboutScroll.js
 *
 * Drives the BlackHole entrance ramp and ambient breathing for the About section.
 *
 * ARCHITECTURE
 * ─────────────────────────────────────────────────────────────────────────
 * This hook owns TWO scroll-driven behaviours:
 *
 * 1. ENTRANCE RAMP (triggered when About section enters the viewport)
 *    BlackHole's particleCount and orbitSpeed ramp from near-zero → resting
 *    values as scroll progresses through Stage E (0→1 within the About section
 *    scroll zone). This reads as particles being captured into orbit — not a
 *    new layer switching on.
 *
 * 2. AMBIENT BREATHING (continuous, after entrance completes)
 *    Once scroll has passed the entrance zone, BlackHole's orbitSpeed gently
 *    oscillates using a time-based sine wave driven from requestAnimationFrame
 *    rather than scroll — so it stays alive even when the user stops scrolling.
 *    particleCount stays fixed at BH_REST.particleCount after entrance.
 *
 * STAGE E CONSTANTS (rawP 0→1 within the About section scroll zone)
 * ─────────────────────────────────────────────────────────────────────────
 * These control only the BlackHole entrance ramp. Tune them independently
 * of the Hero transition stages in useHeroTransition.js.
 *
 *   STAGE_E_START  0.00  BlackHole at minimum (near-invisible at bottom of viewport)
 *   STAGE_E_END    0.55  BlackHole at resting values — entrance complete
 *   (0.55→1.00) is the "fully settled in" zone — ambient breathing only
 *
 * CONNECTION TO HERO TRANSITION
 * ─────────────────────────────────────────────────────────────────────────
 * This hook attaches its ScrollTrigger to the About section container — a
 * separate trigger from the Hero transition's ScrollTrigger. This keeps them
 * fully composable: the Hero hook controls its 350vh pinned zone, this hook
 * controls the About section's own scroll behaviour. They share the same
 * GSAP instance but have independent ScrollTrigger instances.
 *
 * REDUCED MOTION
 * ─────────────────────────────────────────────────────────────────────────
 * Skips the ramp entirely — BlackHole initialises directly at BH_REST values.
 * No ambient breathing oscillation (orbitSpeed stays constant).
 *
 * @param {Object}          params
 * @param {React.RefObject} params.aboutRef          - the About section container
 * @param {Function}        params.onBlackHoleUpdate - callback({particleCount, orbitSpeed})
 *                                                    About section calls setState with this.
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════════════════
// STAGE E BOUNDARY CONSTANTS  (rawP units, 0.0 → 1.0)
// Controls only the BlackHole entrance ramp within the About section.
// ═══════════════════════════════════════════════════════════════════════════

// rawP 0.00: About section has just started entering the viewport.
// BlackHole starts at BH_ENTRY (near-invisible).
const STAGE_E_START = 0.00;

// rawP 0.55: Entrance complete. BlackHole at full resting state.
// Below this threshold → ramp is active.
// Above this → ambient breathing takes over.
const STAGE_E_END   = 0.55;

// ═══════════════════════════════════════════════════════════════════════════
// BLACKHOLE PROP KEYFRAMES
// ═══════════════════════════════════════════════════════════════════════════

// Entry state — what BlackHole starts at before the ramp begins.
// particleCount:1 avoids a visible pop when the count jumps from 0.
// orbitSpeed:0 → particles stationary, reads as "just forming".
const BH_ENTRY = {
  particleCount: 1,       // minimal — prevents pop on first render
  orbitSpeed:    0,       // stationary dust
};

// Resting state — what BlackHole settles at after the entrance ramp.
// These are the "fully alive in About" values.
const BH_REST = {
  particleCount: 600,     // lower than BlackHole's default 1000 —
                          // ambient GlitterWrap is also running simultaneously.
                          // Combined budget: 500 (ambient glitter) + 600 (BlackHole) = 1100 particles.
  orbitSpeed:    3.5,     // slightly below BlackHole default (4) — comfortable, not frantic
};

// Ambient breathing range — orbitSpeed oscillates between these two values
// once the entrance is complete. particleCount stays fixed at BH_REST.particleCount.
const BH_BREATHE_MIN = 3.0;  // slow coast
const BH_BREATHE_MAX = 4.2;  // gentle acceleration
const BH_BREATHE_PERIOD = 8; // seconds per full oscillation cycle

// ─────────────────────────────────────────────────────────────────────────
// Easing
// ─────────────────────────────────────────────────────────────────────────

// easeOutCubic: fast ramp up at start, tapers at rest — particles being
// "captured" into stable orbit reads as natural gravitational settling.
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// Clamp 0→1
const clamp01 = (t) => Math.max(0, Math.min(1, t));

// Normalize rawP into 0→1 within [start, end]
const rangeProgress = (rawP, start, end) =>
  clamp01((rawP - start) / (end - start));

// Linear interpolation
const lerp = (a, b, t) => a + (b - a) * t;

// ─────────────────────────────────────────────────────────────────────────

export function useAboutScroll({ aboutRef, onBlackHoleUpdate }) {
  // Track whether entrance has completed so the RAF breathing loop knows
  // whether to start. Stored as a ref to avoid re-render.
  const entranceCompleteRef = useRef(false);
  const breatheRafRef       = useRef(null);
  const breatheStartRef     = useRef(null); // performance.now() at entrance end

  useEffect(() => {
    if (!aboutRef.current) return;

    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Reduced-motion fast path ─────────────────────────────────────────
    // Skip ramp, initialise at rest, no breathing oscillation.
    if (prefersReduced) {
      onBlackHoleUpdate?.({
        particleCount: BH_REST.particleCount,
        orbitSpeed:    BH_REST.orbitSpeed,
      });
      return;
    }

    // ── Initialise at entry state ─────────────────────────────────────────
    onBlackHoleUpdate?.({
      particleCount: BH_ENTRY.particleCount,
      orbitSpeed:    BH_ENTRY.orbitSpeed,
    });

    // ── Ambient breathing RAF loop ─────────────────────────────────────────
    // Only runs after entranceCompleteRef is set to true.
    // Uses a sine wave against elapsed time — frame-rate independent.
    const startBreathing = () => {
      breatheStartRef.current = performance.now();

      const tick = (now) => {
        const elapsed = (now - breatheStartRef.current) / 1000; // seconds
        // Sine: 0 → 2π over BH_BREATHE_PERIOD seconds
        const t = (Math.sin((elapsed / BH_BREATHE_PERIOD) * Math.PI * 2) + 1) / 2; // 0→1
        const speed = lerp(BH_BREATHE_MIN, BH_BREATHE_MAX, t);

        onBlackHoleUpdate?.({
          particleCount: BH_REST.particleCount, // stays fixed
          orbitSpeed:    speed,
        });

        breatheRafRef.current = requestAnimationFrame(tick);
      };

      breatheRafRef.current = requestAnimationFrame(tick);
    };

    // ── Stage E: ScrollTrigger on the About section ───────────────────────
    // Attaches to the About section container. Independent of the Hero
    // transition ScrollTrigger — composable, not tangled.
    //
    // start: "top 90%" — trigger fires when About's top is 90% down the
    //   viewport (just entering from below). This gives a small head start
    //   before the user actually sees the content.
    // end: "top 30%" — by the time About's top is 30% from the top of the
    //   viewport, the ramp (STAGE_E_START→STAGE_E_END) should be running.
    //   The full ScrollTrigger progress 0→1 spans this range.
    //
    // scrub: 1.5 — slight lag so the ramp feels pulled by gravity.
    const st = ScrollTrigger.create({
      trigger: aboutRef.current,
      start: 'top 90%',
      end: 'top 30%',
      scrub: 1.5,

      onUpdate(self) {
        // If entrance already completed, don't fight the breathing RAF.
        if (entranceCompleteRef.current) return;

        const rawP = self.progress;
        const eP = easeOutCubic(rangeProgress(rawP, STAGE_E_START, STAGE_E_END));

        onBlackHoleUpdate?.({
          particleCount: Math.round(lerp(BH_ENTRY.particleCount, BH_REST.particleCount, eP)),
          orbitSpeed:    lerp(BH_ENTRY.orbitSpeed, BH_REST.orbitSpeed, eP),
        });

        // Mark entrance complete when we cross the end boundary.
        if (rawP >= STAGE_E_END && !entranceCompleteRef.current) {
          entranceCompleteRef.current = true;
          startBreathing();
        }
      },

      onLeave() {
        // Past the trigger zone entirely — entrance must be complete.
        if (!entranceCompleteRef.current) {
          entranceCompleteRef.current = true;
          onBlackHoleUpdate?.({
            particleCount: BH_REST.particleCount,
            orbitSpeed:    BH_REST.orbitSpeed,
          });
          startBreathing();
        }
      },

      onEnterBack() {
        // User scrolled back up into the About section.
        // Stop the breathing loop, restart the entrance ramp from current scroll.
        if (breatheRafRef.current) {
          cancelAnimationFrame(breatheRafRef.current);
          breatheRafRef.current = null;
        }
        entranceCompleteRef.current = false;
      },

      onLeaveBack() {
        // Scrolled fully back above the About section — reset to entry state.
        if (breatheRafRef.current) {
          cancelAnimationFrame(breatheRafRef.current);
          breatheRafRef.current = null;
        }
        entranceCompleteRef.current = false;
        onBlackHoleUpdate?.({
          particleCount: BH_ENTRY.particleCount,
          orbitSpeed:    BH_ENTRY.orbitSpeed,
        });
      },
    });

    return () => {
      st.kill();
      if (breatheRafRef.current) {
        cancelAnimationFrame(breatheRafRef.current);
      }
    };
  }, [aboutRef, onBlackHoleUpdate]);
}
