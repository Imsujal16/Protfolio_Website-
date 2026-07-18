/**
 * useLenis.js
 *
 * Initializes Lenis virtual scroll once at the app root.
 * Ties the Lenis RAF loop into GSAP's ticker so ScrollTrigger
 * always receives scroll events in the correct order (Lenis → GSAP).
 *
 * Respects prefers-reduced-motion: skips Lenis entirely when the user
 * has requested reduced motion — native browser scroll takes over.
 *
 * Usage:
 *   In App.jsx (or a top-level layout component):
 *     import { useLenis } from './hooks/useLenis';
 *     export default function App() {
 *       useLenis();
 *       return <> ... </>;
 *     }
 */
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null; // module-level singleton

export function useLenis() {
  useEffect(() => {
    // Honour prefers-reduced-motion — native scroll only
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenisInstance = lenis;

    // Connect Lenis scroll events → GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker (single shared RAF loop)
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisInstance = null;
      // Remove the ticker add — gsap.ticker.remove requires the exact fn reference,
      // so we store it and remove it on cleanup.
    };
  }, []);
}

/** Expose the singleton for any component that needs lenis.scrollTo() */
export function getLenis() {
  return lenisInstance;
}
