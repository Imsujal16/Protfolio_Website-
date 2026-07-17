/**
 * useHeroTransition.js
 *
 * Drives the Hero → next-section dissolve transition via GSAP ScrollTrigger
 * with scrub, matching the existing pattern in NarrativeSections.jsx.
 *
 * ARCHITECTURE
 * ─────────────────────────────────────────────────────────────────────────
 * The hook attaches ONE ScrollTrigger to the outer "scroll-track" element
 * (a div that is 2× viewport-tall, so the hero can be pinned while 50vh
 * of actual scrolling drives the full dim-and-blend).
 *
 * "progress" runs 0 → 1 over the scrub zone. Every animated value is a
 * pure function of that number — no per-frame state, no React re-renders
 * for DOM-written values. GlitterWrap is updated via an onProgress callback
 * that the shell uses to call React setState — the only way to update
 * GlitterWrap props without touching its internals (it spreads props into
 * a new object on every render, so external propsRef mutation doesn't reach it).
 *
 * SCROLL MATH (tune here if the timing feels off)
 * ─────────────────────────────────────────────────────────────────────────
 *  progress 0.00 → 0.00   Hero fully visible, GlitterWrap at full brightness
 *  progress 0.00 → 0.60   GlitterWrap dims: brightness 100 → 0
 *                          glitterIntensity: 3 → 0
 *                          trailAmount: 100 → 140  (particles settle/comet)
 *  progress 0.00 → 0.70   Hero content (panels + portrait) fade + lift-away
 *  progress 0.30 → 1.00   Blending overlay fades in (hero bg → next-section bg)
 *  progress 1.00           Hero fully dissolved, next section takes over
 *
 * REDUCED MOTION
 * ─────────────────────────────────────────────────────────────────────────
 * When prefers-reduced-motion is set, skip the ScrollTrigger entirely.
 * Hero opacities stay at 1; no scale, no blur, no parallax.
 *
 * @param {Object}          params
 * @param {React.RefObject} params.scrollTrackRef   - the tall outer div (150vh)
 * @param {React.RefObject} params.heroPinRef        - the sticky 100vh hero panel
 * @param {React.RefObject} params.heroContentRef    - wraps panels + portrait (fades+moves)
 * @param {React.RefObject} params.overlayRef        - colour-bridge overlay div
 * @param {Function}        params.onGlitterUpdate   - callback({brightness, glitterIntensity, trailAmount})
 *                                                    called by GSAP on each tick.
 *                                                    Shell uses this to setState → GlitterWrap re-renders.
 */

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useHeroTransition({
  scrollTrackRef,
  heroPinRef,
  heroContentRef,
  overlayRef,
  onGlitterUpdate,
}) {
  useEffect(() => {
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Reduced-motion fast path ──────────────────────────────────────────
    if (prefersReduced) {
      if (heroContentRef.current) {
        heroContentRef.current.style.opacity   = '1';
        heroContentRef.current.style.transform = 'none';
      }
      if (overlayRef.current) {
        overlayRef.current.style.opacity = '0';
      }
      return;
    }

    // ── Default GlitterWrap props at scroll=0 ─────────────────────────────
    // Mirror COMPONENT_DEFAULTS in GlitterWrap.jsx.
    const GLITTER_START = {
      brightness:       100,
      glitterIntensity: 3,
      trailAmount:      100,
    };

    // ── Target GlitterWrap props at scroll=1 ─────────────────────────────
    const GLITTER_END = {
      brightness:       0,    // fully dark — particles invisible
      glitterIntensity: 0,    // no more flash events
      trailAmount:      140,  // longer comet tails → settling feeling
    };

    // lerp helper — inline, no allocation
    const lerp = (a, b, t) => a + (b - a) * t;

    // clamp helper
    const clamp01 = (t) => Math.max(0, Math.min(1, t));

    // ── easing: smoothstep gives a perceptually natural S-curve ──────────
    // Avoids the abrupt start/end of a linear ramp.
    const smoothstep = (t) => t * t * (3 - 2 * t);

    const st = ScrollTrigger.create({
      trigger: scrollTrackRef.current,

      // GSAP pins heroPinRef (position:fixed) for the duration of the scrub.
      // pinSpacing:false because the outer scrollTrack owns the extra height.
      pin: heroPinRef.current,
      pinSpacing: false,

      // Scrub zone: top of track aligns with viewport top → 50vh of scroll
      // is the full 0→1 progress range.
      //
      // TUNING: increase "+=50%" to slow the transition; decrease to speed it.
      // Must stay in sync with the `scrubZone` prop passed to HeroTransitionShell
      // so the div height and the ScrollTrigger end point agree.
      start: 'top top',
      end: '+=50%',   // 50vh of scroll = full 0 → 1 progress

      // scrub:1 — 1-second momentum lag behind the scrollbar.
      // NarrativeSections uses scrub:0.7; slightly slower here so the
      // dimming reads as deliberate, not reactive.
      scrub: 1,

      onUpdate(self) {
        const rawP = self.progress;

        // ── Per-sub-range progress ─────────────────────────────────────
        // Each variable maps a sub-segment of rawP into its own 0→1 value
        // with independent smoothstep easing.
        // Tune the range endpoints (rawP units, 0.0 → 1.0) to shift timing.

        // GlitterWrap dims over the FIRST 60% of scroll
        const glitterP = smoothstep(clamp01(rawP / 0.60));

        // Hero content (panels + portrait) fades over the FIRST 70%
        const contentP = smoothstep(clamp01(rawP / 0.70));

        // Colour overlay bridges over the LAST 70% (starts 30% into scroll)
        const overlayP = smoothstep(clamp01((rawP - 0.30) / 0.70));

        // ── 1. GlitterWrap live prop update ───────────────────────────
        // onGlitterUpdate triggers a React setState in the shell, causing
        // GlitterWrap to re-render with new props values so its internal
        // propsRef.current gets updated for the next canvas frame.
        onGlitterUpdate?.({
          brightness:       lerp(GLITTER_START.brightness,       GLITTER_END.brightness,       glitterP),
          glitterIntensity: lerp(GLITTER_START.glitterIntensity, GLITTER_END.glitterIntensity, glitterP),
          trailAmount:      lerp(GLITTER_START.trailAmount,      GLITTER_END.trailAmount,      glitterP),
        });

        // ── 2. Hero content: fade + subtle upward drift ───────────────
        // Only opacity + transform — never width/height/margin/top.
        // will-change:transform,opacity is declared in CSS on this element.
        if (heroContentRef.current) {
          const opacity    = 1 - contentP;
          // Drift: 0px at rest → -28px at fully faded.
          // Small enough to read as "lifting away", not teleporting.
          const translateY = -28 * contentP;
          heroContentRef.current.style.opacity   = opacity;
          heroContentRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
        }

        // ── 3. Colour bridge overlay ──────────────────────────────────
        // Fades from transparent → next section's background colour.
        // Change .hero-transition-overlay background in CSS to alter colour.
        if (overlayRef.current) {
          overlayRef.current.style.opacity = overlayP;
        }
      },

      onLeave() {
        // Snap to final values if user scrolls faster than the scrub lag.
        if (heroContentRef.current) {
          heroContentRef.current.style.opacity   = '0';
          heroContentRef.current.style.transform = 'translate3d(0, -28px, 0)';
        }
        if (overlayRef.current) overlayRef.current.style.opacity = '1';
        onGlitterUpdate?.({
          brightness:       GLITTER_END.brightness,
          glitterIntensity: GLITTER_END.glitterIntensity,
          trailAmount:      GLITTER_END.trailAmount,
        });
      },

      onEnterBack() {
        // User scrolled back up — restore full hero state.
        if (heroContentRef.current) {
          heroContentRef.current.style.opacity   = '1';
          heroContentRef.current.style.transform = 'translate3d(0, 0px, 0)';
        }
        if (overlayRef.current) overlayRef.current.style.opacity = '0';
        onGlitterUpdate?.({
          brightness:       GLITTER_START.brightness,
          glitterIntensity: GLITTER_START.glitterIntensity,
          trailAmount:      GLITTER_START.trailAmount,
        });
      },
    });

    return () => {
      st.kill();
    };
  }, [scrollTrackRef, heroPinRef, heroContentRef, overlayRef, onGlitterUpdate]);
}
