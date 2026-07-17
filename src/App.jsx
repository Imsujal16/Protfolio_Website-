import { useRef, useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import MaskReveal from './components/MaskReveal';
import { DesignerPanel, CoderPanel } from './components/HeroPanels';
import HeroTransitionShell from './components/HeroTransitionShell';
import AboutSection from './components/AboutSection';

/**
 * GlitterWrap visual props — only the static/artistic ones.
 * speed, brightness, glitterIntensity, and trailAmount are managed
 * internally by HeroTransitionShell's staged scroll transition.
 *
 * COLOUR PALETTE: white + red + yellow.
 * Must match SHARED_COLORS_GLITTER and SHARED_COLORS_BH in AboutSection.jsx
 * for visual continuity across Hero → transition → About BlackHole.
 */
const HERO_GLITTER_PROPS = {
  color1:        '#ffffff',
  color2:        '#FF0000',
  color3:        '#FFE500',
  density:       100,
  starSize:      20,
  focalDepth:    13,
  turbulence:    0,
  particleCount: 500,
  reverse:       false,
  // NOTE: speed, brightness, glitterIntensity, trailAmount are NOT listed here —
  // they are driven by the transition hook through the staged scroll choreography.
};

export default function App() {
  /**
   * aboutSectionRef
   * ────────────────────────────────────────────────────────────────────────
   * Passed to HeroTransitionShell (→ useHeroTransition Stage D) so the
   * About section rises into view as the transition completes.
   * Also received by AboutSection via forwardRef for its own useAboutScroll.
   */
  const aboutSectionRef = useRef(null);

  /**
   * BlackHole cross-component state bridge
   * ────────────────────────────────────────────────────────────────────────
   * Stage D in useHeroTransition pre-warms BlackHole (1 → 200 particles) so
   * the disk is already forming while the transition is still finishing.
   * useAboutScroll then takes over and ramps to BH_REST (600 particles).
   *
   * We lift the BlackHole state up to App so both systems can write to it:
   *   HeroTransitionShell (Stage D pre-warm) → onBlackHoleSeed
   *   AboutSection (useAboutScroll ramp)     → its own internal state (preferred)
   *
   * Actually — the cleaner approach is to keep BlackHole state inside
   * AboutSection (it already has its own onBlackHoleUpdate setState there),
   * and only use this App-level callback to feed Stage D → AboutSection via
   * a ref-forwarded imperative handle.
   *
   * BUT: forwardRef only forwards a DOM ref, not an imperative handle, unless
   * we useImperativeHandle in AboutSection. The simplest correct wiring is:
   *   AboutSection exposes a `onBlackHoleUpdate` prop that App.jsx owns.
   *   App.jsx passes the same callback to both HeroTransitionShell and AboutSection.
   *
   * This way Stage D and useAboutScroll both write through the same setState.
   */
  const [liveBH, setLiveBH] = useState({ particleCount: 1, orbitSpeed: 0 });

  const onBlackHoleUpdate = useCallback((next) => {
    setLiveBH((prev) => {
      if (
        Math.abs(prev.particleCount - next.particleCount) < 1 &&
        Math.abs(prev.orbitSpeed    - next.orbitSpeed)    < 0.02
      ) return prev;
      return { particleCount: next.particleCount, orbitSpeed: next.orbitSpeed };
    });
  }, []);

  return (
    <>
      <Navbar />

      {/*
       * HeroTransitionShell — v2 + BlackHole pre-warm
       * ──────────────────────────────────────────────────────────────────
       * Owns a 350vh scroll-track (100vh hero + 250vh transition corridor).
       *
       * Scroll choreography (250vh = 0→1 progress):
       *   Stage A  0–25%   Hero content exits (fade, lift, scale)
       *   Stage B  20–46%  GlitterWrap momentum surge (speed/glitter spike)
       *   Stage C  40–78%  Settle + dim (held mid-point — the "pause")
       *   Stage D  72–100% Overlay (→ #000000) bridges; About section rises;
       *                    BlackHole pre-warmed (1 → 200 particles, slow orbit)
       *
       * onBlackHoleUpdate is shared with AboutSection so Stage D and
       * useAboutScroll both write through the same setState call.
       */}
      <HeroTransitionShell
        glitterProps={HERO_GLITTER_PROPS}
        scrubZone="250vh"
        nextSectionRef={aboutSectionRef}
        onBlackHoleUpdate={onBlackHoleUpdate}
      >
        <div className="hero-overlay-wrapper">
          <DesignerPanel />
          <MaskReveal />
          <CoderPanel />
        </div>
      </HeroTransitionShell>

      {/*
       * AboutSection
       * ──────────────────────────────────────────────────────────────────
       * Layer order inside: ambient GlitterWrap (z:0) → BlackHole (z:1) → content (z:2).
       *
       * liveBH is written by both Stage D (pre-warm: 1→200 particles) and
       * useAboutScroll (full ramp: 200→600 particles + breathing).
       * AboutSection receives these as props rather than managing them internally,
       * so Stage D and useAboutScroll share the same state.
       *
       * forwardRef on AboutSection → aboutSectionRef → Stage D animates
       * opacity + translateY as the transition completes.
       */}
      <AboutSection
        ref={aboutSectionRef}
        liveBH={liveBH}
        onBlackHoleUpdate={onBlackHoleUpdate}
      />
    </>
  );
}
