import { useRef } from 'react';
import { useLenis } from './hooks/useLenis';
import Navbar from './components/Navbar';
import MaskReveal from './components/MaskReveal';
import { DesignerPanel, CoderPanel } from './components/HeroPanels';
import HeroTransition from './components/HeroTransition';
import AboutSection from './components/AboutSection';

export default function App() {
  // Initialize Lenis smooth scroll + GSAP ticker integration at the app root
  useLenis();

  // heroRef is forwarded to HeroTransition so it can target the hero's
  // inner content (scale/fade exit) without prop-drilling through the Hero component.
  const heroRef = useRef(null);

  return (
    <>
      {/* Navbar: fixed, always above everything via z-index in its own CSS */}
      <Navbar />

      {/* ── Hero (sticky) ──────────────────────────────────────────────────
          position:sticky + top:0 keeps the hero pinned in the viewport
          while the HeroTransition panel (below in DOM) scrolls over it.
          z-index:1 ensures it sits below the transition panel (z:10).
      ─────────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="hero-section"
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#000000',
          zIndex: 1,
        }}
      >
        <div
          className="hero-overlay-wrapper"
          style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}
        >
          <DesignerPanel />
          <MaskReveal />
          <CoderPanel />
        </div>
      </section>

      {/* ── HeroTransition + About section ───────────────────────
          HeroTransition is the dark panel that clip-path-wipes up over the
          sticky hero as you scroll. It receives heroRef so it can also
          animate the hero content's exit (scale + fade, scroll-scrubbed).

          Inside it:
          • AboutSection   — placeholder layout, content TBD
      ─────────────────────────────────────────────────────────────────── */}
      <HeroTransition heroRef={heroRef}>
        <AboutSection />
      </HeroTransition>
    </>
  );
}

