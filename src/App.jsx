import { useState, useEffect, useLayoutEffect } from 'react';
import { useLenis, getLenis } from './hooks/useLenis';
import Navbar from './components/Navbar';
import HeroSequence from './components/HeroSequence';
import AboutSection from './components/AboutSection';
import Loader from './components/Loader';

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  // 1. Initial attempt to kill native scroll memory
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // 1.5. Remove native pre-loader after React successfully mounts and paints
  useEffect(() => {
    const preloader = document.getElementById('native-preloader');
    if (preloader) {
      preloader.remove();
    }
  }, []);

  // 2. Backup reset exactly when the lock is lifted
  useEffect(() => {
    if (isAppReady) {
      window.scrollTo(0, 0);
      // Reset Lenis if it's already running
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(0, { immediate: true });
    }
  }, [isAppReady]);

  // Initialize Lenis smooth scroll + GSAP ticker integration at the app root
  useLenis();

  return (
    <>
      {/* Loader always sits outside the scroll lock wrapper */}
      <Loader onComplete={() => setIsAppReady(true)} />

      {/* THE GOD LEVEL FIX:
          Physically pins the site to the top of the screen until the loader is completely done.
          The browser literally cannot show a scrolled section through the mask. */}
      <div style={!isAppReady ? { position: 'fixed', inset: 0, width: '100%', height: '100vh', overflow: 'hidden' } : {}}>
        <main>
          {/* Navbar: fixed, always above everything via z-index in its own CSS */}
          <Navbar />

          {/* ── Hero Sequence ──────────────────────────────────────────────
              300vh sticky scroll container: hero shrinks + signature reveals
          ─────────────────────────────────────────────────────────────────── */}
          <HeroSequence />

          {/* ── About section follows naturally after the 300vh scroll space ── */}
          <AboutSection />
        </main>
      </div>
    </>
  );
}

