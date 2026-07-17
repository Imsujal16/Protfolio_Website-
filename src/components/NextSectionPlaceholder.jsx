/**
 * NextSectionPlaceholder.jsx
 *
 * Bare-minimum placeholder for the section that follows the Hero.
 * Purpose: give HeroTransitionShell's colour-bridge overlay something
 * to hand off to — the transition needs a real element at the correct
 * scroll position to land on.
 *
 * WHAT GOES HERE LATER
 * ─────────────────────────────────────────────────────────────────────────
 * Replace this component with your actual next section (e.g. <NarrativeSections />)
 * when that content is ready. The transition system doesn't care what's inside —
 * it only cares that something sits below the HeroTransitionShell in the DOM.
 *
 * BACKGROUND COLOUR
 * ─────────────────────────────────────────────────────────────────────────
 * Set to #ffffff (var(--paper)) — matching both the Hero (MaskReveal white)
 * and NarrativeSections.css, so the colour-bridge overlay is seamless.
 * If your actual next section is dark, change this AND the
 * .hero-transition-overlay background in HeroTransitionShell.css to match.
 */

import './NextSectionPlaceholder.css';

export default function NextSectionPlaceholder() {
  return (
    <section
      className="next-section-placeholder"
      aria-label="Next section — content coming soon"
    >
      {/* Empty intentionally. Add content here when the About section is built. */}
    </section>
  );
}
