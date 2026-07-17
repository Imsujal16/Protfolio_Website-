import Navbar from './components/Navbar';
import MaskReveal from './components/MaskReveal';
import { DesignerPanel, CoderPanel } from './components/HeroPanels';
import HeroTransitionShell from './components/HeroTransitionShell';
import NextSectionPlaceholder from './components/NextSectionPlaceholder';

/**
 * GlitterWrap visual props — only the static/artistic ones.
 * brightness, glitterIntensity, and trailAmount are managed
 * internally by HeroTransitionShell's scroll transition.
 *
 * Tune colours, speed, particle count, etc. here freely.
 */
const HERO_GLITTER_PROPS = {
  color1:       '#ffffff',
  color2:       '#FF0000',
  color3:       '#FFE500',
  speed:        5,
  density:      100,
  starSize:     20,
  focalDepth:   13,
  turbulence:   0,
  particleCount: 500,
  reverse:      false,
};

export default function App() {
  return (
    <>
      <Navbar />

      {/*
       * HeroTransitionShell
       * ────────────────────────────────────────────────────────────────
       * Owns a 150vh scroll-track (100vh hero + 50vh transition corridor).
       * During the 50vh corridor the hero is pinned sticky while GlitterWrap
       * dims out and the hero content fades + lifts away.
       *
       * Children are the existing hero elements, unchanged.
       * They are wrapped in .hero-content-wrap (position:absolute, inset:0)
       * which preserves their absolute-positioning behaviour while allowing
       * the wrapper to be faded as a unit.
       *
       * ASSUMPTION: MaskReveal has background:#ffffff which occludes the
       * GlitterWrap canvas behind it. The transition still works because:
       *   a) GlitterWrap dims to 0 brightness before the hero fully fades.
       *   b) The colour-bridge overlay (#ffffff) then takes over.
       * If you want visible particles through the portrait, set MaskReveal's
       * background to transparent.
       *
       * hero-overlay-wrapper: position:relative ONLY — not a flex container.
       * MaskReveal fills it naturally (100vw × 100vh in document flow).
       * DesignerPanel and CoderPanel are position:absolute overlays.
       * They do NOT affect MaskReveal's size or position.
       *
       * DOM order matters for mobile (≤960px) where panels switch to
       * position:static and stack vertically:
       *   DesignerPanel → first in DOM  → appears above the portrait ✓
       *   MaskReveal    → second in DOM → the portrait fills the screen ✓
       *   CoderPanel    → third in DOM  → appears below the portrait ✓
       */}
      <HeroTransitionShell
        glitterProps={HERO_GLITTER_PROPS}
        scrubZone="50vh"
      >
        <div className="hero-overlay-wrapper">
          <DesignerPanel />
          <MaskReveal />
          <CoderPanel />
        </div>
      </HeroTransitionShell>

      {/*
       * NextSectionPlaceholder
       * ────────────────────────────────────────────────────────────────
       * Bare white div — the transition's landing surface.
       * Replace with <NarrativeSections /> (or whatever comes next)
       * when that content is ready. The transition system is agnostic
       * to what is here; it only needs something below in the DOM.
       */}
      <NextSectionPlaceholder />
    </>
  );
}
