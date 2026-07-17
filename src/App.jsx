import { useRef } from 'react';
import Navbar from './components/Navbar';
import MaskReveal from './components/MaskReveal';
import { DesignerPanel, CoderPanel } from './components/HeroPanels';
import HeroTransitionShell from './components/HeroTransitionShell';
import NextSectionPlaceholder from './components/NextSectionPlaceholder';

/**
 * GlitterWrap visual props — only the static/artistic ones.
 * speed, brightness, glitterIntensity, and trailAmount are managed
 * internally by HeroTransitionShell's staged scroll transition.
 *
 * Tune colours, density, particle count, etc. here freely.
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
  // nextSectionRef is passed to HeroTransitionShell so Stage D of the
  // transition can animate the placeholder section rising into view.
  const nextSectionRef = useRef(null);

  return (
    <>
      <Navbar />

      {/*
       * HeroTransitionShell — v2
       * ──────────────────────────────────────────────────────────────────
       * Owns a 350vh scroll-track (100vh hero + 250vh transition corridor).
       *
       * Scroll choreography (250vh = 0→1 progress):
       *   Stage A  0–25%   Hero content exits (fade, lift, scale)
       *   Stage B  20–46%  GlitterWrap momentum surge (speed/glitter spike)
       *   Stage C  40–78%  Settle + dim (held mid-point — the "pause")
       *   Stage D  72–100% Overlay bridges colour; next section rises in
       *
       * scrubZone must stay in sync with end: "+=250%" in useHeroTransition.js.
       *
       * ASSUMPTION: MaskReveal has background:#ffffff which occludes the
       * GlitterWrap canvas. The transition still reads correctly because:
       *   a) GlitterWrap dims to 0 before the hero fully fades.
       *   b) The white colour-bridge overlay then completes the hand-off.
       * Set MaskReveal's background to transparent to see particles through portrait.
       */}
      <HeroTransitionShell
        glitterProps={HERO_GLITTER_PROPS}
        scrubZone="250vh"
        nextSectionRef={nextSectionRef}
      >
        <div className="hero-overlay-wrapper">
          <DesignerPanel />
          <MaskReveal />
          <CoderPanel />
        </div>
      </HeroTransitionShell>

      {/*
       * NextSectionPlaceholder — forwardRef, animated by Stage D.
       * Replace with <NarrativeSections /> when content is ready.
       * If the receiving component doesn't forwardRef, wrap it in a div
       * and pass nextSectionRef to the wrapper div instead.
       */}
      <NextSectionPlaceholder ref={nextSectionRef} />
    </>
  );
}
