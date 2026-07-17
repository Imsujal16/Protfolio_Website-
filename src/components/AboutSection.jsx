/**
 * AboutSection.jsx — v2
 *
 * The About section shell. Replaces NextSectionPlaceholder.
 * forwardRef so HeroTransitionShell's Stage D can animate the container
 * (opacity + translateY) as the transition completes.
 *
 * BLACKHOLE STATE (liveBH / onBlackHoleUpdate)
 * ─────────────────────────────────────────────────────────────────────────
 * Lifted to App.jsx so TWO systems can write to it without fighting:
 *   - Stage D (useHeroTransition): pre-warms BlackHole (1→200 particles)
 *     while the transition overlay is still fading in.
 *   - useAboutScroll: owns the full ramp (200→600 particles + breathing)
 *     once About is in view.
 * Both write through the same onBlackHoleUpdate callback → same setState.
 *
 * LAYER ORDER (bottom → top)
 * ─────────────────────────────────────────────────────────────────────────
 *   z-index 0  .about-ambient-glitter   Quiet drifting GlitterWrap
 *   z-index 1  .about-blackhole         BlackHole accretion disk
 *   z-index 2  .about-content           Content placeholder (empty for now)
 *
 * BACKGROUND COLOUR CONTINUITY — CONFIRMED
 * ─────────────────────────────────────────────────────────────────────────
 * BlackHole hardcodes `BG = "#000000"`.
 * .hero-transition-overlay background is now #000000 (patched in HeroTransitionShell.css).
 * .about-section background is #000000 (in AboutSection.css).
 * Chain: Stage D overlay (#000000) → About section (#000000) → BlackHole BG (#000000).
 * Zero seam at any of those boundaries.
 *
 * FOCAL POINT CONTINUITY — CONFIRMED
 * ─────────────────────────────────────────────────────────────────────────
 * GlitterWrap tunnel converges at cx/cy = viewport centre (50%, 50%).
 * BlackHole void: voidX=50, voidY=50 → same point on screen.
 * "The tunnel was flying toward this black hole the whole time."
 *
 * COLOUR PALETTE CONTINUITY — CONFIRMED
 * ─────────────────────────────────────────────────────────────────────────
 * Hero GlitterWrap:  color1=#ffffff, color2=#FF0000, color3=#FFE500
 * Ambient GlitterWrap: same palette
 * BlackHole.colors:  ['#ffffff', '#FF0000', '#FFE500']
 * Same particle "material" across all three.
 *
 * COMBINED PARTICLE BUDGET
 * ─────────────────────────────────────────────────────────────────────────
 * Ambient GlitterWrap:  500 particles @ brightness:8 (near-invisible)
 * BlackHole at rest:    600 particles (BH_REST in useAboutScroll.js)
 * Total at peak:        1100 particles across 2 canvas contexts.
 */

import { forwardRef, useRef, useCallback } from 'react';
import GlitterWrap from './GlitterWrap';
import BlackHole from './BlackHole';
import { useAboutScroll } from '../hooks/useAboutScroll';
import './AboutSection.css';

// ═══════════════════════════════════════════════════════════════════════════
// SHARED COLOUR PALETTE — must match HERO_GLITTER_PROPS in App.jsx
// ═══════════════════════════════════════════════════════════════════════════
const SHARED_COLORS_GLITTER = {
  color1: '#ffffff',
  color2: '#FF0000',
  color3: '#FFE500',
};

// BlackHole.colors is an array
const SHARED_COLORS_BH = ['#ffffff', '#FF0000', '#FFE500'];

// ═══════════════════════════════════════════════════════════════════════════
// AMBIENT GLITTERWRAP PROPS — quiet, always-on, never scroll-driven
// ═══════════════════════════════════════════════════════════════════════════
const AMBIENT_GLITTER_PROPS = {
  ...SHARED_COLORS_GLITTER,
  brightness:       8,    // subliminal — distant drifting dust
  glitterIntensity: 0,    // no flash events — pure slow drift
  speed:            1.5,
  trailAmount:      170,  // very long comet-like trails
  particleCount:    500,
  density:          100,
  starSize:         20,
  focalDepth:       13,   // same as Hero — tunnel aims at the same vanishing point
  turbulence:       0,
  reverse:          false,
};

// ═══════════════════════════════════════════════════════════════════════════
// BLACKHOLE STATIC PROPS (non-scroll-driven)
// particleCount and orbitSpeed come from liveBH prop (lifted state in App.jsx)
// ═══════════════════════════════════════════════════════════════════════════
const BH_STATIC_PROPS = {
  colors:      SHARED_COLORS_BH,
  centre: {
    voidRadius: 40,
    voidX:      50,   // dead centre — same focal point as GlitterWrap cx/cy
    voidY:      50,
  },
  showCenter:   true,
  outerRadius:  70,
  tilt:         20,
  tiltSideway:  160,
  trail:        50,
  pullSpeed:    0,
  particleSize: 4,
};

// ─────────────────────────────────────────────────────────────────────────

const AboutSection = forwardRef(function AboutSection(
  { liveBH, onBlackHoleUpdate },
  ref
) {
  // aboutRef for useAboutScroll's ScrollTrigger.
  // `ref` (forwarded) is for Stage D to animate the container.
  // Merged via callback ref so both point at the same DOM node.
  const aboutRef = useRef(null);

  const setRefs = useCallback((node) => {
    aboutRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  // Wire the About scroll hook — drives BlackHole entrance ramp + breathing.
  // onBlackHoleUpdate is the shared callback from App.jsx.
  useAboutScroll({ aboutRef, onBlackHoleUpdate });

  // Merged BlackHole props — static + live scroll-driven from App state.
  const mergedBH = {
    ...BH_STATIC_PROPS,
    particleCount: liveBH?.particleCount ?? 1,
    orbitSpeed:    liveBH?.orbitSpeed    ?? 0,
    style: { width: '100%', height: '100%' },
  };

  return (
    /*
     * .about-section
     * Background: #000000 — matches Stage D overlay + BlackHole BG. No seam.
     * Initial state: opacity:0, translateY:20px (CSS). Stage D animates to rest.
     */
    <section
      ref={setRefs}
      className="about-section"
      aria-label="About"
    >
      {/*
       * z-index:0 — Ambient GlitterWrap
       * Quiet drifting background dust. Always running. Not scroll-driven.
       * Provides connective tissue: same particle system as the Hero tunnel.
       */}
      <div className="about-ambient-glitter" aria-hidden="true">
        <GlitterWrap
          {...AMBIENT_GLITTER_PROPS}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/*
       * z-index:1 — BlackHole
       * Void at (50%, 50%) — same focal point as GlitterWrap's tunnel.
       * Particle count and orbit speed ramp up via Stage D + useAboutScroll.
       * After entrance, ambient breathing keeps it alive while user reads.
       */}
      <div className="about-blackhole" aria-hidden="true">
        <BlackHole {...mergedBH} />
      </div>

      {/*
       * z-index:2 — About content (placeholder)
       * Add all About section text, images, and layout here.
       */}
      <div className="about-content">
        {/* About content placeholder — do not add content here yet */}
      </div>
    </section>
  );
});

export default AboutSection;
