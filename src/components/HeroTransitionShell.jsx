/**
 * HeroTransitionShell.jsx
 *
 * A REUSABLE wrapper that:
 *   1. Pins the Hero section sticky while the transition scroll zone runs.
 *   2. Renders GlitterWrap as a background canvas layer behind the hero content.
 *   3. Drives brightness / glitterIntensity / trailAmount into GlitterWrap via
 *      React state (the only correct way without touching GlitterWrap internals —
 *      GlitterWrap does `propsRef.current = { ...DEFAULTS, ...props }` on every
 *      render, so it must receive updated values as actual React props).
 *   4. Fades + lifts the hero content children as scroll progresses.
 *   5. Fades in a colour-bridge overlay to bridge Hero bg → next-section bg.
 *
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────
 *   <HeroTransitionShell glitterProps={{ color1: '#fff', color2: '#FF0000', color3: '#FFE500' }}>
 *     {/* your existing Hero children (DesignerPanel, MaskReveal, CoderPanel) *}
 *   </HeroTransitionShell>
 *
 * All static GlitterWrap visual props go in `glitterProps`.
 * The three scroll-driven props (brightness, glitterIntensity, trailAmount) are
 * managed internally and merged at render time.
 *
 * ASSUMPTIONS ABOUT HERO STRUCTURE
 * ─────────────────────────────────────────────────────────────────────────
 * - Hero children occupy 100vh × 100vw (full viewport).
 * - Children are overlaid via position:absolute — wrapping them in
 *   .hero-content-wrap (position:absolute, inset:0) preserves their layout.
 * - GlitterWrap sits BEHIND MaskReveal. MaskReveal has background:#ffffff
 *   which occludes the starfield. The transition still works because GlitterWrap
 *   dims to 0 before the hero fades, after which the overlay takes over.
 *   To see particles through the portrait, set MaskReveal's background
 *   to transparent.
 *
 * NEXT CHAPTER PLUG-IN
 * ─────────────────────────────────────────────────────────────────────────
 * For each new chapter, wrap in HeroTransitionShell:
 *   <HeroTransitionShell glitterProps={chapterGlitterProps}>
 *     <YourChapterContent />
 *   </HeroTransitionShell>
 */

import { useRef, useState, useCallback } from 'react';
import GlitterWrap from './GlitterWrap';
import { useHeroTransition } from '../hooks/useHeroTransition';
import './HeroTransitionShell.css';

/**
 * HeroTransitionShell
 *
 * @param {React.ReactNode} children       - Hero content (DesignerPanel, MaskReveal, CoderPanel)
 * @param {Object}          glitterProps   - Static GlitterWrap visual props (colours, speed, etc.)
 *                                          brightness/glitterIntensity/trailAmount are overridden by scroll.
 * @param {string}          [scrubZone]    - CSS length for the transition corridor height.
 *                                          Default '50vh'. Must stay in sync with
 *                                          the "+=50%" end offset in useHeroTransition.js.
 */
export default function HeroTransitionShell({
  children,
  glitterProps = {},
  scrubZone = '50vh',
}) {
  // ── Refs for DOM elements ───────────────────────────────────────────────
  const scrollTrackRef = useRef(null); // 150vh outer spacer div
  const heroPinRef     = useRef(null); // 100vh sticky panel (GSAP pins this)
  const heroContentRef = useRef(null); // wraps hero children — fades + lifts
  const overlayRef     = useRef(null); // colour-bridge overlay

  // ── Scroll-driven GlitterWrap values ───────────────────────────────────
  // Stored as React state so GlitterWrap receives them as actual props.
  // GlitterWrap does `propsRef.current = { ...DEFAULTS, ...props }` on every
  // render, so external ref mutation won't reach its internal propsRef —
  // only prop updates via re-render work.
  //
  // GSAP calls onGlitterUpdate from its scrub tick. We use functional setState
  // with a shallow-equality guard so we only trigger re-renders when values
  // actually change (avoids redundant renders when scrub is idle).
  const [liveGlitter, setLiveGlitter] = useState({
    brightness:       glitterProps.brightness       ?? 100,
    glitterIntensity: glitterProps.glitterIntensity ?? 3,
    trailAmount:      glitterProps.trailAmount      ?? 100,
  });

  // ── Stable callback for the hook ──────────────────────────────────────
  // useCallback with empty deps so the hook's useEffect doesn't re-run.
  const onGlitterUpdate = useCallback((next) => {
    setLiveGlitter((prev) => {
      // Shallow equality check — skip re-render if values are same (scrub idle)
      if (
        Math.abs(prev.brightness       - next.brightness)       < 0.01 &&
        Math.abs(prev.glitterIntensity - next.glitterIntensity) < 0.01 &&
        Math.abs(prev.trailAmount      - next.trailAmount)      < 0.01
      ) {
        return prev; // no re-render
      }
      return next;
    });
  }, []);

  // ── Wire up the scroll transition ─────────────────────────────────────
  useHeroTransition({
    scrollTrackRef,
    heroPinRef,
    heroContentRef,
    overlayRef,
    onGlitterUpdate,
  });

  // ── Merged GlitterWrap props ───────────────────────────────────────────
  // Spread static artistic props, then override with live scroll-driven values.
  const mergedGlitter = {
    ...glitterProps,
    brightness:       liveGlitter.brightness,
    glitterIntensity: liveGlitter.glitterIntensity,
    trailAmount:      liveGlitter.trailAmount,
  };

  return (
    /*
     * .hero-scroll-track
     * ─────────────────────────────────────────────────────────────────────
     * Owns ALL the vertical space for hero + transition zone.
     * Height = 100vh (hero) + scrubZone (scroll runway).
     * The sticky child only takes 100vh; the remaining scrubZone is the
     * runway during which the hero is pinned and dims.
     */
    <div
      ref={scrollTrackRef}
      className="hero-scroll-track"
      style={{ height: `calc(100vh + ${scrubZone})` }}
    >
      {/*
       * .hero-pin
       * ─────────────────────────────────────────────────────────────────
       * GSAP applies position:fixed to this div during the scrub zone.
       * overflow:hidden clips sub-pixel rounding at the viewport edges.
       */}
      <div ref={heroPinRef} className="hero-pin">

        {/*
         * .glitter-layer — GlitterWrap canvas
         * ─────────────────────────────────────────────────────────────
         * z-index:0, behind all hero content.
         * GlitterWrap fills this 100%×100% with its canvas.
         *
         * NOTE: MaskReveal's background:#ffffff occludes the starfield.
         * Set MaskReveal's background to transparent to see particles
         * through the portrait. The transition works either way.
         */}
        <div className="glitter-layer" aria-hidden="true">
          <GlitterWrap
            {...mergedGlitter}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/*
         * .hero-content-wrap
         * ─────────────────────────────────────────────────────────────
         * Wraps existing Hero children without changing their layout.
         * position:absolute + inset:0 mirrors hero-pin's dimensions.
         * useHeroTransition writes opacity and translateY here directly.
         * will-change:transform,opacity is set in CSS → pre-promoted GPU layer.
         */}
        <div ref={heroContentRef} className="hero-content-wrap">
          {children}
        </div>

        {/*
         * .hero-transition-overlay
         * ─────────────────────────────────────────────────────────────
         * Colour-bridge overlay. Starts transparent, fades to the next
         * section's landing colour. Edit background in HeroTransitionShell.css.
         */}
        <div
          ref={overlayRef}
          className="hero-transition-overlay"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
