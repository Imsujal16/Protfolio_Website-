/**
 * HeroTransition.jsx
 *
 * Orchestrates the cinematic Hero → About transition.
 *
 * Mechanism:
 *   1. The Hero section is wrapped with `position: sticky; top: 0` so it
 *      stays pinned in the viewport as the user scrolls.
 *   2. This component sits immediately after the sticky Hero in DOM order.
 *      It contains the About section (and all sections that follow).
 *   3. A GSAP ScrollTrigger pin is applied to the hero-inner content:
 *      - While the user scrolls through the first `pinDistance` pixels
 *        below the hero, the hero content scales + fades out (scrubbed).
 *   4. The About panel's clip-path animates from `inset(100% 0 0 0)` →
 *      `inset(0% 0 0 0)` in sync with the same scroll range, creating
 *      the illusion of the dark card sliding up over the pinned hero.
 *
 * Reduced motion:
 *   All scrubbed transforms are skipped. Sections appear immediately visible.
 *
 * GPU-only properties animated: transform, opacity, clip-path.
 * No layout-triggering properties (no width/height/top/left animation).
 */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HeroTransition.css';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HeroTransition({ heroRef, children }) {
  const panelRef  = useRef(null);

  useEffect(() => {
    const hero  = heroRef?.current;
    const panel = panelRef.current;
    if (!hero || !panel) return;

    if (REDUCED_MOTION()) {
      // Immediately visible, no animation
      gsap.set(panel, { clipPath: 'inset(0% 0 0 0)' });
      return;
    }

    // The about-panel starts fully clipped (hidden below viewport)
    gsap.set(panel, { clipPath: 'inset(100% 0 0 0)' });

    const ctx = gsap.context(() => {
      // ── Hero content exits: scale down + fade out (scroll-scrubbed) ──────
      const heroInner = hero.querySelector('.hero-overlay-wrapper');
      if (heroInner) {
        gsap.to(heroInner, {
          scale: 0.92,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,          // fires when the about panel enters
            start: 'top bottom',     // when top of about panel hits bottom of viewport
            end: 'top top',          // when about panel's top aligns with viewport top
            scrub: 1.2,
          },
        });
      }

      // ── About panel wipes up: clip-path inset 100% → 0% (scroll-scrubbed) ─
      gsap.to(panel, {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          start: 'top bottom',
          end: 'top top',
          scrub: 1.2,
        },
      });

      // ── Subtle border-radius on hero as it gets covered ──────────────────
      gsap.to(hero, {
        borderRadius: '0 0 32px 32px',
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          start: 'top bottom',
          end: 'top 40%',
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
  }, [heroRef]);

  return (
    <div ref={panelRef} className="ht-panel">
      {children}
    </div>
  );
}
