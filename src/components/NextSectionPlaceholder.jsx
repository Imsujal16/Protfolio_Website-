/**
 * NextSectionPlaceholder.jsx — v2
 *
 * Now uses forwardRef so HeroTransitionShell can pass a ref to the hook,
 * allowing Stage D to animate this shell rising into view (opacity + translateY).
 *
 * Initial state: opacity:0, translateY:20px — set in CSS.
 * The hook will animate to opacity:1, translateY:0 during Stage D.
 *
 * Replace this component with <NarrativeSections /> (or whatever comes next)
 * when content is ready. The receiving component must also forwardRef if you
 * want Stage D to animate it — or wrap it in a div and pass the ref to that.
 */

import { forwardRef } from 'react';
import './NextSectionPlaceholder.css';

const NextSectionPlaceholder = forwardRef(function NextSectionPlaceholder(props, ref) {
  return (
    <section
      ref={ref}
      className="next-section-placeholder"
      aria-label="Next section — content coming soon"
    >
      {/* Empty intentionally. Add content when the About section is built. */}
    </section>
  );
});

export default NextSectionPlaceholder;
