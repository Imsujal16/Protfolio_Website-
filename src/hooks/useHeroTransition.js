/**
 * useHeroTransition.js  — v2 (cinematic staged rewrite)
 *
 * ROOT CAUSE OF v1 FAILURE
 * ─────────────────────────────────────────────────────────────────────────
 * The old version used `end: '+=50%'` (50vh of scroll) as the entire
 * transition corridor, and `scrubZone="50vh"` in the shell. On a typical
 * 900px viewport that's only ~450px of physical scroll — the whole sequence
 * collapsed into a second or two of movement.
 *
 * Additionally, all animated values (content fade, glitter dim, overlay)
 * were mapped to near-identical sub-ranges (0→0.60, 0→0.70, 0.30→1.00)
 * of that tiny window, so they fired simultaneously rather than in sequence.
 * `speed` was never animated at all — no momentum beat existed.
 *
 * ARCHITECTURE
 * ─────────────────────────────────────────────────────────────────────────
 * One GSAP ScrollTrigger, scrub:2, end: "+=250%" → 250vh of pinned scroll.
 * A single rawP (0→1) drives four distinct stages via their own sub-range
 * slices and independent easing curves. Named constants at the top of this
 * file control every stage boundary — change them to retune timing by feel.
 *
 * STAGE MAP  (rawP = 0 → 1, each unit = 1% of the 250vh corridor)
 * ─────────────────────────────────────────────────────────────────────────
 *  Stage A  0.00 → 0.25   Hero content exits (fade + lift). GlitterWrap untouched.
 *  Stage B  0.20 → 0.45   Momentum beat: speed + glitterIntensity surge UP.
 *  Stage C  0.40 → 0.78   Settle: speed/brightness/glitter fall, trail lengthens.
 *                          Held mid-point — neither Hero nor next section.
 *  Stage D  0.72 → 1.00   Overlay bridges to next-section colour. Next shell rises.
 *
 * Note: stages overlap intentionally at boundaries to feel continuous.
 *
 * EASING
 * ─────────────────────────────────────────────────────────────────────────
 * Each stage gets its own cubic-bezier easing applied AFTER the sub-range
 * normalization so they have independent weight. No linear scrubbing.
 *
 * REDUCED MOTION
 * ─────────────────────────────────────────────────────────────────────────
 * Collapsed to a single opacity crossfade over a 60vh corridor. No stages,
 * no scale, no momentum beat, no parallax.
 *
 * @param {Object}          params
 * @param {React.RefObject} params.scrollTrackRef    - tall outer div (100vh + 250vh = 350vh)
 * @param {React.RefObject} params.heroPinRef         - sticky 100vh panel (GSAP pins this)
 * @param {React.RefObject} params.heroContentRef     - wraps hero children — fades + lifts
 * @param {React.RefObject} params.overlayRef         - colour-bridge overlay
 * @param {React.RefObject} params.nextSectionRef     - the next section shell (rises in Stage D)
 * @param {Function}        params.onGlitterUpdate    - callback({brightness, glitterIntensity, trailAmount, speed})
 * @param {Function}        [params.onBlackHoleUpdate] - optional callback({particleCount, orbitSpeed})
 *                                                      Stage D pre-warms BlackHole for fast-scrollers.
 *                                                      Primary BlackHole ramp is in useAboutScroll.
 */

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════════════════
// STAGE BOUNDARY CONSTANTS  (rawP units, 0.0 → 1.0)
// Retune these by feel — they control the choreography timing.
// ═══════════════════════════════════════════════════════════════════════════

// Stage A: Hero content (panels, portrait) fades out and lifts up.
// GlitterWrap is still fully alive during this stage.
const STAGE_A_START = 0.00;
const STAGE_A_END   = 0.25;

// Stage B: Momentum beat. Speed + glitterIntensity surge before falling.
// Starts while Stage A is finishing so it doesn't feel like dead air.
const STAGE_B_START = 0.20;
const STAGE_B_END   = 0.46;

// Stage C: Settle + dim. Speed, brightness, glitterIntensity all fall.
// trailAmount lengthens (particles drift to a stop).
// This is the "held mid-point" — purposely long.
const STAGE_C_START = 0.40;
const STAGE_C_END   = 0.78;

// Stage D: Colour-bridge overlay fades in. Next section shell rises.
// Starts slightly before Stage C ends for a smooth hand-off.
const STAGE_D_START = 0.72;
const STAGE_D_END   = 1.00;

// ═══════════════════════════════════════════════════════════════════════════
// GLITTER PROP KEYFRAMES
// ═══════════════════════════════════════════════════════════════════════════

// Values at scroll=0 (hero fully visible)
const G_IDLE = {
  brightness:       100,
  glitterIntensity: 3,
  trailAmount:      100,
  speed:            5,
};

// Peak of Stage B momentum surge
const G_SURGE = {
  brightness:       120,   // slightly over-bright for the burst feeling
  glitterIntensity: 8,     // flash events increase
  trailAmount:      85,    // shorter trails = crisper, faster look
  speed:            14,    // nearly 3× faster
};

// Floor at end of Stage C (particles settled, nearly invisible)
const G_FLOOR = {
  brightness:       0,
  glitterIntensity: 0,
  trailAmount:      160,   // very long, slow-dissolving comet tails
  speed:            1,     // almost stopped
};

// ─────────────────────────────────────────────────────────────────────────
// Easing functions  (pure functions, no import needed)
// ─────────────────────────────────────────────────────────────────────────

// smoothstep: ease-in-out S-curve
const smoothstep = (t) => t * t * (3 - 2 * t);

// easeOutCubic: fast start, gradual finish (hero content exits quickly)
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// easeInCubic: slow start, fast finish (momentum surge builds)
const easeInCubic = (t) => t * t * t;

// easeInOutQuart: slow-slow, deep settle (stage C)
const easeInOutQuart = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

// easeOutQuart: fast reveal, slow stop (next section rise)
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

// Normalize rawP into a 0→1 value within [start, end]
const rangeProgress = (rawP, start, end) =>
  Math.max(0, Math.min(1, (rawP - start) / (end - start)));

// Linear interpolation, no allocation
const lerp = (a, b, t) => a + (b - a) * t;

// ─────────────────────────────────────────────────────────────────────────

export function useHeroTransition({
  scrollTrackRef,
  heroPinRef,
  heroContentRef,
  overlayRef,
  nextSectionRef,
  onGlitterUpdate,
  onBlackHoleUpdate,
}) {
  useEffect(() => {
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Reduced-motion fast path ──────────────────────────────────────────
    // Collapse the whole thing to a single crossfade over a short scroll.
    if (prefersReduced) {
      if (heroContentRef.current) {
        heroContentRef.current.style.opacity   = '1';
        heroContentRef.current.style.transform = 'none';
      }
      if (overlayRef.current) {
        overlayRef.current.style.opacity = '0';
      }

      // Simple reduced-motion ScrollTrigger: just fade hero content out
      const stReduced = ScrollTrigger.create({
        trigger: scrollTrackRef.current,
        pin: heroPinRef.current,
        pinSpacing: false,
        start: 'top top',
        end: '+=60%',    // 60vh — just enough to crossfade, no staging
        scrub: 1,
        onUpdate(self) {
          const p = smoothstep(self.progress);
          if (heroContentRef.current) {
            heroContentRef.current.style.opacity = 1 - p;
          }
          if (overlayRef.current) {
            overlayRef.current.style.opacity = p > 0.3
              ? smoothstep((p - 0.3) / 0.7)
              : 0;
          }
          onGlitterUpdate?.({
            brightness:       lerp(G_IDLE.brightness, G_FLOOR.brightness, p),
            glitterIntensity: lerp(G_IDLE.glitterIntensity, G_FLOOR.glitterIntensity, p),
            trailAmount:      lerp(G_IDLE.trailAmount, G_FLOOR.trailAmount, p),
            speed:            lerp(G_IDLE.speed, G_FLOOR.speed, p),
          });
        },
      });

      return () => stReduced.kill();
    }

    // ── Full cinematic transition ─────────────────────────────────────────

    const st = ScrollTrigger.create({
      trigger: scrollTrackRef.current,

      pin: heroPinRef.current,
      pinSpacing: false,

      // ⚠️  THIS WAS THE BUG IN v1: "+=50%" (50vh) was far too short.
      // 250vh of scroll gives each of the four stages real breathing room.
      // Keep in sync with `scrubZone` prop in HeroTransitionShell + App.jsx.
      start: 'top top',
      end: '+=250%',    // 250vh of pinned scroll = full 0→1 progress

      // scrub:2 — 2-second lag. Makes the canvas feel heavy/physical.
      // A lower value (1) feels snappy; higher (3+) feels sluggish.
      scrub: 2,

      onUpdate(self) {
        const rawP = self.progress;

        // ── Stage A: Hero content exits ───────────────────────────────
        // rawP: STAGE_A_START → STAGE_A_END  (0.00 → 0.25)
        // Easing: easeOutCubic — exits fast, settles at end position.
        // Hero content fades and drifts upward. GlitterWrap untouched.
        {
          const aP = easeOutCubic(rangeProgress(rawP, STAGE_A_START, STAGE_A_END));
          if (heroContentRef.current) {
            // Opacity: 1 → 0
            const opacity = 1 - aP;
            // Vertical lift: 0px → -40px (subtle upward exit)
            const translateY = -40 * aP;
            // Scale: 1 → 0.96 (slight pinch inward as it fades)
            const scale = 1 - 0.04 * aP;
            heroContentRef.current.style.opacity   = opacity;
            heroContentRef.current.style.transform =
              `translate3d(0, ${translateY}px, 0) scale(${scale.toFixed(4)})`;
          }
        }

        // ── Stage B: Momentum surge ───────────────────────────────────
        // rawP: STAGE_B_START → STAGE_B_END  (0.20 → 0.46)
        // The surge is a triangle: ramps up over the first half of this range,
        // then falls back. The falling feeds directly into Stage C.
        // Easing on the rise: easeInCubic (slow build → punchy peak).
        {
          const bRaw = rangeProgress(rawP, STAGE_B_START, STAGE_B_END);
          // Triangle: peaks at 0.5 of bRaw
          const bTriangle = bRaw < 0.5
            ? easeInCubic(bRaw / 0.5)           // 0 → 1 on first half
            : easeOutCubic(1 - (bRaw - 0.5) / 0.5); // 1 → 0 on second half

          // At bP=0 → G_IDLE. At bP=1 → G_SURGE. At bP back to 0 → hands to Stage C.
          // NOTE: Stage B and Stage C overlap. In the overlap zone (rawP 0.40–0.46)
          // the Stage C easing overrides Stage B for speed/brightness/glitter.
          // We only push Stage B values while it's the dominant stage (rawP < STAGE_C_START).
          if (rawP < STAGE_C_START) {
            onGlitterUpdate?.({
              brightness:       lerp(G_IDLE.brightness,       G_SURGE.brightness,       bTriangle),
              glitterIntensity: lerp(G_IDLE.glitterIntensity, G_SURGE.glitterIntensity, bTriangle),
              trailAmount:      lerp(G_IDLE.trailAmount,      G_SURGE.trailAmount,      bTriangle),
              speed:            lerp(G_IDLE.speed,            G_SURGE.speed,            bTriangle),
            });
          }
        }

        // ── Stage C: Settle and dim ───────────────────────────────────
        // rawP: STAGE_C_START → STAGE_C_END  (0.40 → 0.78)
        // Long, deliberate fall from G_SURGE peak → G_FLOOR minimum.
        // This is the "held mid-point" — intentionally extended.
        // Easing: easeInOutQuart — slow start/end, heaviest in the middle.
        if (rawP >= STAGE_C_START) {
          const cP = easeInOutQuart(rangeProgress(rawP, STAGE_C_START, STAGE_C_END));

          // At cP=0 we interpolate from G_SURGE (where Stage B peaked out)
          // rather than from G_IDLE, so there's no jump at the handoff.
          const surgeOrIdle = rawP < STAGE_B_END
            ? {
                // Still partially in Stage B peak — use wherever Stage B left off.
                // (This only applies in the very narrow overlap 0.40–0.46.)
                brightness:       G_SURGE.brightness,
                glitterIntensity: G_SURGE.glitterIntensity,
                trailAmount:      G_SURGE.trailAmount,
                speed:            G_SURGE.speed,
              }
            : G_SURGE; // fully past Stage B, start from the surge peak

          onGlitterUpdate?.({
            brightness:       lerp(surgeOrIdle.brightness,       G_FLOOR.brightness,       cP),
            glitterIntensity: lerp(surgeOrIdle.glitterIntensity, G_FLOOR.glitterIntensity, cP),
            trailAmount:      lerp(surgeOrIdle.trailAmount,      G_FLOOR.trailAmount,      cP),
            speed:            lerp(surgeOrIdle.speed,            G_FLOOR.speed,            cP),
          });
        }

        // ── Stage D: Next section resolves ────────────────────────────
        // rawP: STAGE_D_START → STAGE_D_END  (0.72 → 1.00)
        // Colour-bridge overlay fades in. About section shell rises.
        // BlackHole pre-warmed here so fast-scrollers don't see it absent.
        // Primary BlackHole ramp is in useAboutScroll (scroll-triggered).
        {
          const dP = rangeProgress(rawP, STAGE_D_START, STAGE_D_END);
          const overlayP = smoothstep(dP);
          if (overlayRef.current) {
            overlayRef.current.style.opacity = overlayP;
          }

          // About section shell: rises from 20px below to rest position.
          if (nextSectionRef?.current) {
            const nextP     = easeOutQuart(dP);
            const nextY     = 20 * (1 - nextP); // 20px → 0px
            const nextAlpha = nextP;
            nextSectionRef.current.style.opacity   = nextAlpha;
            nextSectionRef.current.style.transform =
              `translate3d(0, ${nextY.toFixed(2)}px, 0)`;
          }

          // BlackHole pre-warm: ramp particleCount from 1 → ~200 over Stage D.
          // This is a gentle seed so the disk is already forming before the
          // user sees it. useAboutScroll owns the full ramp to BH_REST.
          onBlackHoleUpdate?.({
            particleCount: Math.round(lerp(1, 200, easeOutQuart(dP))),
            orbitSpeed:    lerp(0, 1.5, dP), // slow initial orbit
          });
        }
      },

      onLeave() {
        // Snap everything to final state for fast-scrollers.
        if (heroContentRef.current) {
          heroContentRef.current.style.opacity   = '0';
          heroContentRef.current.style.transform = 'translate3d(0, -40px, 0) scale(0.96)';
        }
        if (overlayRef.current) overlayRef.current.style.opacity = '1';
        if (nextSectionRef?.current) {
          nextSectionRef.current.style.opacity   = '1';
          nextSectionRef.current.style.transform = 'translate3d(0, 0px, 0)';
        }
        onGlitterUpdate?.({
          brightness:       G_FLOOR.brightness,
          glitterIntensity: G_FLOOR.glitterIntensity,
          trailAmount:      G_FLOOR.trailAmount,
          speed:            G_FLOOR.speed,
        });
        // BlackHole pre-warm complete — leave at Stage D final values.
        // useAboutScroll takes over from here.
        onBlackHoleUpdate?.({
          particleCount: 200,
          orbitSpeed:    1.5,
        });
      },

      onEnterBack() {
        // Restore full hero state when scrolling back up.
        if (heroContentRef.current) {
          heroContentRef.current.style.opacity   = '1';
          heroContentRef.current.style.transform = 'translate3d(0, 0px, 0) scale(1)';
        }
        if (overlayRef.current) overlayRef.current.style.opacity = '0';
        if (nextSectionRef?.current) {
          nextSectionRef.current.style.opacity   = '0';
          nextSectionRef.current.style.transform = 'translate3d(0, 20px, 0)';
        }
        onGlitterUpdate?.({
          brightness:       G_IDLE.brightness,
          glitterIntensity: G_IDLE.glitterIntensity,
          trailAmount:      G_IDLE.trailAmount,
          speed:            G_IDLE.speed,
        });
        // Reset BlackHole to entry state — useAboutScroll re-ramps on scroll.
        onBlackHoleUpdate?.({
          particleCount: 1,
          orbitSpeed:    0,
        });
      },
    });

    return () => {
      st.kill();
    };
  }, [scrollTrackRef, heroPinRef, heroContentRef, overlayRef, nextSectionRef, onGlitterUpdate, onBlackHoleUpdate]);
}
