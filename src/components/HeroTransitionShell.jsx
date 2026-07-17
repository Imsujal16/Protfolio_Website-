/**
 * HeroTransitionShell.jsx — v2 (cinematic staged rewrite)
 *
 * Changes from v1:
 *   - scrubZone default changed from '50vh' to '250vh' (the core fix).
 *   - onGlitterUpdate now also drives `speed` (the missing momentum prop).
 *   - nextSectionRef forwarded to the hook so Stage D can animate the
 *     placeholder shell rising into view.
 *   - liveGlitter state now includes `speed` in the equality guard.
 *
 * WHAT THIS WRAPS
 * ─────────────────────────────────────────────────────────────────────────
 *   <HeroTransitionShell glitterProps={{ color1: '#fff', color2: '#FF0000', color3: '#FFE500' }}>
 *     {/* hero children — DesignerPanel, MaskReveal, CoderPanel *}
 *   </HeroTransitionShell>
 *   <NextSectionPlaceholder ref={nextRef} />
 *
 * Pass `nextSectionRef` to this shell so Stage D can animate it.
 *
 * ASSUMPTIONS ABOUT HERO STRUCTURE
 * ─────────────────────────────────────────────────────────────────────────
 * - Hero children occupy 100vh × 100vw.
 * - Children are position:absolute — wrapping them in .hero-content-wrap
 *   (position:absolute, inset:0) preserves their layout.
 * - GlitterWrap sits behind MaskReveal. MaskReveal has background:#ffffff
 *   which occludes the starfield. The transition works regardless because
 *   GlitterWrap dims to zero before the hero fades and the overlay takes over.
 *   Set MaskReveal background to transparent to see particles through portrait.
 */

import { useRef, useState, useCallback, forwardRef } from 'react';
import GlitterWrap from './GlitterWrap';
import { useHeroTransition } from '../hooks/useHeroTransition';
import './HeroTransitionShell.css';

/**
 * HeroTransitionShell
 *
 * @param {React.ReactNode}     children         - Hero content
 * @param {Object}              glitterProps     - Static GlitterWrap props (colours, density, etc.)
 *                                               speed/brightness/glitterIntensity/trailAmount are overridden by scroll.
 * @param {string}              [scrubZone]      - Height of the scroll corridor. Default '250vh'.
 *                                               Keep in sync with `end: '+=250%'` in useHeroTransition.js.
 * @param {React.RefObject}     [nextSectionRef] - Ref to the next-section shell so Stage D can animate it.
 */
export default function HeroTransitionShell({
  children,
  glitterProps = {},
  scrubZone = '250vh',
  nextSectionRef,
}) {
  // ── DOM refs ─────────────────────────────────────────────────────────────
  const scrollTrackRef = useRef(null); // 350vh outer spacer (100vh hero + 250vh runway)
  const heroPinRef     = useRef(null); // 100vh sticky panel — GSAP pins this
  const heroContentRef = useRef(null); // wraps hero children — fades/lifts/scales
  const overlayRef     = useRef(null); // colour-bridge overlay (Stage D)

  // ── Scroll-driven GlitterWrap state ──────────────────────────────────────
  // React state so GlitterWrap receives values as actual props.
  // GlitterWrap does `propsRef.current = { ...DEFAULTS, ...props }` on every
  // render, so external ref mutation never reaches its internal RAF — only
  // prop changes via re-render propagate correctly.
  //
  // speed is now included (was missing in v1 — the momentum bug).
  const [liveGlitter, setLiveGlitter] = useState({
    brightness:       glitterProps.brightness       ?? 100,
    glitterIntensity: glitterProps.glitterIntensity ?? 3,
    trailAmount:      glitterProps.trailAmount      ?? 100,
    speed:            glitterProps.speed            ?? 5,
  });

  // ── Stable callback — hook calls this every GSAP tick ───────────────────
  // useCallback with empty deps keeps the hook's useEffect from re-firing.
  // Shallow-equality guard avoids redundant re-renders when scrub is idle.
  const EQUALITY_THRESHOLD = 0.05; // wider than v1 (0.01) to reduce render count
  const onGlitterUpdate = useCallback((next) => {
    setLiveGlitter((prev) => {
      if (
        Math.abs(prev.brightness       - next.brightness)       < EQUALITY_THRESHOLD &&
        Math.abs(prev.glitterIntensity - next.glitterIntensity) < EQUALITY_THRESHOLD &&
        Math.abs(prev.trailAmount      - next.trailAmount)      < EQUALITY_THRESHOLD &&
        Math.abs(prev.speed            - next.speed)            < EQUALITY_THRESHOLD
      ) {
        return prev; // bail — same values, no re-render
      }
      return {
        brightness:       next.brightness,
        glitterIntensity: next.glitterIntensity,
        trailAmount:      next.trailAmount,
        speed:            next.speed,
      };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Wire transition hook ──────────────────────────────────────────────────
  useHeroTransition({
    scrollTrackRef,
    heroPinRef,
    heroContentRef,
    overlayRef,
    nextSectionRef,
    onGlitterUpdate,
  });

  // ── Merge static + live GlitterWrap props ────────────────────────────────
  // Static artistic props from caller; live scroll-driven props from state.
  const mergedGlitter = {
    ...glitterProps,
    brightness:       liveGlitter.brightness,
    glitterIntensity: liveGlitter.glitterIntensity,
    trailAmount:      liveGlitter.trailAmount,
    speed:            liveGlitter.speed,
  };

  return (
    /*
     * .hero-scroll-track
     * ───────────────────────────────────────────────────────────────────────
     * Height = 100vh (visible hero) + scrubZone (250vh scroll runway).
     * Total = 350vh. The sticky hero-pin occupies only the first 100vh;
     * the remaining 250vh are the corridor during which it is pinned.
     *
     * ⚠️ v1 had this at 150vh (100 + 50). The single biggest cause of the
     *    "resolves too fast" bug. Now 350vh (100 + 250).
     */
    <div
      ref={scrollTrackRef}
      className="hero-scroll-track"
      style={{ height: `calc(100vh + ${scrubZone})` }}
    >
      {/*
       * .hero-pin
       * ─────────────────────────────────────────────────────────────────────
       * GSAP applies position:fixed during the scrub zone.
       * overflow:hidden clips edge artefacts during the pin.
       */}
      <div ref={heroPinRef} className="hero-pin">

        {/*
         * .glitter-layer — GlitterWrap canvas
         * ─────────────────────────────────────────────────────────────────
         * z-index:0, behind all hero content.
         * The transition drives speed, brightness, glitterIntensity, trailAmount.
         * MaskReveal's #ffffff background occludes the canvas — set it to
         * transparent if you want visible particles through the portrait.
         */}
        <div className="glitter-layer" aria-hidden="true">
          <GlitterWrap
            {...mergedGlitter}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/*
         * .hero-content-wrap
         * ─────────────────────────────────────────────────────────────────
         * Wraps hero children without disturbing their absolute layout.
         * Stage A writes opacity, translateY, scale directly here.
         * will-change:transform,opacity → GPU layer pre-promoted.
         */}
        <div ref={heroContentRef} className="hero-content-wrap">
          {children}
        </div>

        {/*
         * .hero-transition-overlay
         * ─────────────────────────────────────────────────────────────────
         * Stage D fades this in (transparent → landing colour).
         * Change background in HeroTransitionShell.css to alter the target.
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
