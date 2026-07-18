/**
 * useSectionReveal.js
 *
 * Reusable GSAP + ScrollTrigger reveal system.
 * Any section can call this hook to opt into cinematic scroll-driven reveals.
 *
 * Supported reveal variants:
 *   'fade-rise'    — opacity + translateY, staggered across all matched children
 *   'mask-wipe'    — clip-path inset wipe reveal per-element
 *   'split-lines'  — line-by-line curtain reveal using SplitType (async)
 *   'scale-in'     — scale(0.93) + opacity → scale(1) + opacity 1, staggered
 *
 * Options:
 *   variant     — one of the strings above (default: 'fade-rise')
 *   scrub       — false = one-shot; number = scrub lag multiplier
 *   stagger     — seconds between child reveals (default: 0.1)
 *   start       — ScrollTrigger start (default: 'top 82%')
 *   duration    — animation duration in seconds (default: 0.85)
 *   ease        — GSAP ease string (default: 'power3.out')
 *   markers     — true to show ScrollTrigger debug markers
 *
 * prefers-reduced-motion:
 *   When active, targets are made instantly visible and the hook returns.
 *
 * Usage:
 *   const sectionRef = useSectionReveal('.js-item', { variant: 'fade-rise' });
 *   return <section ref={sectionRef}> ... </section>;
 */
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Variant implementations ─────────────────────────────────────────────────
// Note: each variant receives the resolved target array and options object.
// They are called inside gsap.context() so all ScrollTriggers are scoped.

function applyFadeRise(targets, opts) {
  const { stagger, duration, ease, start, scrub, markers } = opts;
  // Group stagger under a single ScrollTrigger on the first target
  gsap.from(targets, {
    y: 44,
    autoAlpha: 0,
    duration,
    ease,
    stagger,
    scrollTrigger: {
      trigger: targets[0],
      start,
      scrub: scrub || false,
      once: !scrub,
      markers,
    },
  });
}

function applyMaskWipe(targets, opts) {
  const { duration, ease, start, scrub, markers } = opts;
  targets.forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(0 0 100% 0)', autoAlpha: 0 },
      {
        clipPath: 'inset(0 0 0% 0)',
        autoAlpha: 1,
        duration,
        ease,
        scrollTrigger: {
          trigger: el,
          start,
          scrub: scrub || false,
          once: !scrub,
          markers,
        },
      }
    );
  });
}

function applyScaleIn(targets, opts) {
  const { duration, ease, start, stagger, scrub, markers } = opts;
  gsap.from(targets, {
    scale: 0.93,
    autoAlpha: 0,
    duration,
    ease,
    stagger,
    scrollTrigger: {
      trigger: targets[0],
      start,
      scrub: scrub || false,
      once: !scrub,
      markers,
    },
  });
}

async function applySplitLines(el, opts) {
  // Dynamically import SplitType only when this variant is used
  const { default: SplitType } = await import('split-type');
  const split = new SplitType(el, { types: 'lines' });

  // Wrap each line in an overflow:hidden curtain div for the wipe effect
  split.lines.forEach((line) => {
    const curtain = document.createElement('span');
    curtain.style.cssText = 'display:block;overflow:hidden;';
    line.parentNode.insertBefore(curtain, line);
    curtain.appendChild(line);
  });

  gsap.from(split.lines, {
    yPercent: 105,
    autoAlpha: 0,
    duration: opts.duration,
    ease: opts.ease,
    stagger: opts.stagger,
    scrollTrigger: {
      trigger: el,
      start: opts.start,
      once: true,
      markers: opts.markers,
    },
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSectionReveal(selector, options = {}) {
  const rootRef = useRef(null);

  const {
    variant  = 'fade-rise',
    scrub    = false,
    stagger  = 0.1,
    start    = 'top 82%',
    duration = 0.85,
    ease     = 'power3.out',
    markers  = false,
  } = options;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const opts = { stagger, duration, ease, start, scrub, markers };

    // ── Reduced motion: instantly reveal all targets, no animation ──────────
    if (REDUCED_MOTION()) {
      const els = root.querySelectorAll(selector);
      gsap.set(els, { autoAlpha: 1, clearProps: 'transform,opacity' });
      return undefined;
    }

    // ── Animated path — all ScrollTriggers scoped to root ───────────────────
    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray(selector, root);
      if (!targets.length) return;

      switch (variant) {
        case 'mask-wipe':
          applyMaskWipe(targets, opts);
          break;
        case 'scale-in':
          applyScaleIn(targets, opts);
          break;
        case 'split-lines':
          // async — only operates on the first matched element
          applySplitLines(targets[0], opts);
          break;
        case 'fade-rise':
        default:
          applyFadeRise(targets, opts);
          break;
      }
    }, root); // scopes all GSAP selectors + ScrollTriggers to root element

    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, variant]);

  return rootRef;
}
