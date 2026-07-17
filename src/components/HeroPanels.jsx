/**
 * HeroPanels.jsx — v2 (bug-fix rewrite)
 *
 * BUG 1 FIX — Text clipping / "igner" only visible:
 *   Root cause: per-character clip-path on .char spans INSIDE a
 *   `background-clip: text` parent span caused WebKit to misrender.
 *   The "des" chars (white text) animated correctly but the gradient
 *   parent (-webkit-background-clip:text; -webkit-text-fill-color:transparent)
 *   broke the clip-path rendering on its children.
 *
 *   Fix: replace per-char clip-path with segment-level "curtain reveal":
 *     .seg-curtain { overflow: hidden }   ← the slit/mask
 *     .seg-inner   { will animate y }    ← slides up through the slit
 *   Each word segment is one curtain. GSAP staggers the segments.
 *   Gradient text is applied to .seg-inner directly — no parent conflict.
 *
 * BUG 2 FIX — Panels squashing the portrait:
 *   Root cause: panels were flex siblings of MaskReveal (100vw wide),
 *   causing the flex container to exceed 100vw and compress everything.
 *   Fix: panels are now position:absolute. MaskReveal flows naturally.
 *
 * BUG 3 CONFIRMED: No background, border, or shadow on panel containers.
 *
 * BUG 4 FIX — Mobile: panels switch to static flow (stacked above/below).
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './HeroPanels.css';

/* ── Segment curtain ─────────────────────────────────────────
 * Wraps one text segment in the curtain-reveal structure.
 * The outer .seg-curtain has overflow:hidden — it IS the mask.
 * The inner .seg-inner starts at translateY(105%) via gsap.set()
 * in the parent useEffect, then GSAP animates to y:0.
 *
 * Why NOT per-character clip-path:
 *   clip-path on inline-block children of a -webkit-background-clip:text
 *   parent causes the gradient to not composite correctly in Safari/Chrome.
 *   Segment-level translateY avoids this entirely.
 * ─────────────────────────────────────────────────────────── */
function SegmentCurtain({ children }) {
  return (
    <span className="seg-curtain">
      <span className="seg-inner">{children}</span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* DESIGNER PANEL                                              */
/* ─────────────────────────────────────────────────────────── */

export function DesignerPanel() {
  const panelRef    = useRef(null);
  const eyebrowRef  = useRef(null);
  const dotRef      = useRef(null);
  const headlineRef = useRef(null);
  const gradRef     = useRef(null);  // ref on the gradient span for shimmer
  const subtextRef  = useRef(null);
  const tagsRef     = useRef(null);

  const TAGS = ['Figma', 'Wireframing', 'Prototyping', 'Design Systems'];

  useEffect(() => {
    /* Respect prefers-reduced-motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([eyebrowRef.current, subtextRef.current], { opacity: 1, y: 0 });
      gsap.set(headlineRef.current?.querySelectorAll('.seg-inner'), { y: '0%' });
      gsap.set(tagsRef.current?.querySelectorAll('.tag'), { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {

      /* Set headline segments to hidden position BEFORE the timeline */
      gsap.set(headlineRef.current.querySelectorAll('.seg-inner'), { y: '105%' });

      /* ── Master timeline ── */
      const tl = gsap.timeline({ delay: 0.55 });

      /* 1. Eyebrow label slides up */
      tl.to(eyebrowRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
      });

      /* 2. Headline segments curtain-reveal, staggered */
      tl.to(
        headlineRef.current.querySelectorAll('.seg-inner'),
        {
          y: '0%',
          duration: 0.72,
          ease: 'expo.out',
          stagger: 0.10,
        },
        '-=0.30',
      );

      /* 3. Subtext fades up */
      tl.to(subtextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.20');

      /* 4. Tags stagger in */
      tl.to(
        tagsRef.current.querySelectorAll('.tag'),
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: 'back.out(1.6)',
          stagger: 0.08,
        },
        '-=0.15',
      );

      /* 5. Gradient shimmer — after entrance, loops forever */
      tl.call(() => {
        if (!gradRef.current) return;
        gsap.to(gradRef.current, {
          backgroundPosition: '200% 50%',
          duration: 4,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });
      });

    }, panelRef);

    /* Dot glow — independent infinite loop */
    const dotCtx = gsap.context(() => {
      gsap.to(dotRef.current, {
        filter: 'drop-shadow(0 0 5px var(--warm-glow)) drop-shadow(0 0 10px var(--warm-glow))',
        opacity: 0.45,
        duration: 1.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 0.3,
      });
    }, panelRef);

    return () => {
      ctx.revert();
      dotCtx.revert();
    };
  }, []);

  return (
    <div ref={panelRef} className="side-panel side-panel--left" aria-label="Designer skills">

      {/* Eyebrow */}
      <p ref={eyebrowRef} className="eyebrow eyebrow--warm">
        <span ref={dotRef} className="eyebrow-dot">●</span>
        UI/UX DESIGNER
      </p>

      {/*
        * Headline: "designer."
        *
        * Three segments, each in its own curtain:
        *   "des"   → white (#ffffff via inline style)
        *   "igner" → warm gradient (gradRef for shimmer)
        *   "."     → solid warm accent
        *
        * white-space:nowrap on .headline CSS class prevents wrapping.
        * Each SegmentCurtain is display:inline-block so they sit inline.
        */}
      <h2
        ref={headlineRef}
        className="headline"
        aria-label="designer."
      >
        <SegmentCurtain>
          <span style={{ color: '#ffffff' }}>des</span>
        </SegmentCurtain>
        <SegmentCurtain>
          <span ref={gradRef} className="grad-warm">igner</span>
        </SegmentCurtain>
        <SegmentCurtain>
          <span style={{ color: 'var(--warm)', WebkitTextFillColor: 'var(--warm)' }}>.</span>
        </SegmentCurtain>
      </h2>

      {/* Subtext */}
      <p ref={subtextRef} className="subtext">
        Crafting pixel-perfect, human-centered interfaces that users{' '}
        <span className="subtext-emphasis">feel.</span>
      </p>

      {/* Tags */}
      <div ref={tagsRef} className="tags" aria-label="Design tools">
        {TAGS.map((t) => (
          <span key={t} className="tag tag--warm">{t}</span>
        ))}
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* CODER PANEL                                                 */
/* ─────────────────────────────────────────────────────────── */

export function CoderPanel() {
  const panelRef    = useRef(null);
  const eyebrowRef  = useRef(null);
  const dotRef      = useRef(null);
  const headlineRef = useRef(null);
  const gradRef     = useRef(null);
  const subtextRef  = useRef(null);
  const tagsRef     = useRef(null);

  const TAGS = ['Java', 'C++', 'SQL', 'HTML', 'CSS'];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([eyebrowRef.current, subtextRef.current], { opacity: 1, y: 0 });
      gsap.set(headlineRef.current?.querySelectorAll('.seg-inner'), { y: '0%' });
      gsap.set(tagsRef.current?.querySelectorAll('.tag'), { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {

      gsap.set(headlineRef.current.querySelectorAll('.seg-inner'), { y: '105%' });

      /* Coder timeline starts 0.85s after page load — offset from designer (0.55s)
         so the two panels reveal with a visible stagger, not simultaneously. */
      const tl = gsap.timeline({ delay: 0.85 });

      tl.to(eyebrowRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
      });

      tl.to(
        headlineRef.current.querySelectorAll('.seg-inner'),
        {
          y: '0%',
          duration: 0.72,
          ease: 'expo.out',
          stagger: 0.10,
        },
        '-=0.30',
      );

      tl.to(subtextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.20');

      tl.to(
        tagsRef.current.querySelectorAll('.tag'),
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: 'back.out(1.6)',
          stagger: 0.08,
        },
        '-=0.15',
      );

      tl.call(() => {
        if (!gradRef.current) return;
        gsap.to(gradRef.current, {
          backgroundPosition: '200% 50%',
          duration: 4,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });
      });

    }, panelRef);

    /* Dot glow offset by 0.6s so it breathes out of phase with designer dot */
    const dotCtx = gsap.context(() => {
      gsap.to(dotRef.current, {
        filter: 'drop-shadow(0 0 5px var(--cool-glow)) drop-shadow(0 0 10px var(--cool-glow))',
        opacity: 0.45,
        duration: 1.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 0.6,
      });
    }, panelRef);

    return () => {
      ctx.revert();
      dotCtx.revert();
    };
  }, []);

  return (
    <div ref={panelRef} className="side-panel side-panel--right" aria-label="Coder skills">

      {/* Eyebrow */}
      <p ref={eyebrowRef} className="eyebrow eyebrow--cool">
        <span ref={dotRef} className="eyebrow-dot">●</span>
        FULL STACK DEV
      </p>

      {/*
        * Headline: "<coder/>"
        *
        * Three segments:
        *   "<"     → cool solid bracket
        *   "coder" → cool gradient (gradRef for shimmer)
        *   "/>"    → cool solid bracket
        *
        * Uses .mono class for monospace font stack.
        * white-space:nowrap on .headline prevents "/>" from wrapping.
        * JSX &lt; and /&gt; render the angle brackets correctly.
        */}
      <h2
        ref={headlineRef}
        className="headline mono"
        aria-label="coder — full stack developer"
      >
        <SegmentCurtain>
          <span style={{ color: 'var(--cool)', WebkitTextFillColor: 'var(--cool)' }}>&lt;</span>
        </SegmentCurtain>
        <SegmentCurtain>
          <span ref={gradRef} className="grad-cool">coder</span>
        </SegmentCurtain>
        <SegmentCurtain>
          <span style={{ color: 'var(--cool)', WebkitTextFillColor: 'var(--cool)' }}>/&gt;</span>
        </SegmentCurtain>
      </h2>

      {/* Subtext */}
      <p ref={subtextRef} className="subtext">
        Engineering scalable, robust systems and elegant code that performs.
      </p>

      {/* Tags — explicit 3-then-2 row split so layout is stable at all widths */}
      <div ref={tagsRef} className="tags tags-grid" aria-label="Coding skills">
        {/* Row 1: Java, C++, SQL */}
        <div className="tags-row">
          {['Java', 'C++', 'SQL'].map((t) => (
            <span key={t} className="tag tag--cool">{t}</span>
          ))}
        </div>
        {/* Row 2: HTML, CSS */}
        <div className="tags-row">
          {['HTML', 'CSS'].map((t) => (
            <span key={t} className="tag tag--cool">{t}</span>
          ))}
        </div>
      </div>

    </div>
  );
}
