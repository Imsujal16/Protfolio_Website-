import { useRef, useEffect, useCallback } from 'react';
import frontImg from '../assets/front.png';
import backImg from '../assets/back.png';

/**
 * MaskReveal — Awwwards-grade fluid mask reveal.
 *
 * Physics architecture (pure RAF, zero new dependencies):
 *   - Triple exponential lerp: position (heavy) + radius (lighter) + tilt (laziest)
 *   - Velocity tracking → reactive radius bonus ("momentum bloom")
 *   - 3D parallax tilt via perspective transform on the wrapper
 *   - SVG gooey filter (feGaussianBlur + feColorMatrix) on the mask layer
 *     → turns the crisp circle edge into a liquid, organic blob
 *   - Multi-stop radial gradient with a soft rim glow ring
 *
 * BOUNDARY RULE: layout, grid, objectFit, objectPosition are untouched.
 */

const LERP_POS      = 0.055;   // heavy, slow-starting cursor trail ("liquid mass")
const LERP_RADIUS   = 0.072;   // slightly faster — blob breathes before it glides
const LERP_TILT     = 0.040;   // slowest — parallax plane pivots lazily
const LERP_VEL      = 0.18;    // velocity smoothing (fast for responsiveness)
const MAX_VEL_BONUS = 90;      // max extra radius px when cursor is flying
const BASE_RADIUS   = 240;     // resting reveal size (px)
const TILT_STRENGTH = 8;       // max degrees of 3D tilt

export default function MaskReveal() {
  const containerRef = useRef(null);
  const backLayerRef = useRef(null);
  const physicsRef   = useRef({
    tx: 0, ty: 0,
    cx: 0, cy: 0,
    ttX: 0, ttY: 0,
    ctX: 0, ctY: 0,
    vx: 0, vy: 0,
    prevTx: 0, prevTy: 0,
    targetRadius: 0,
    currentRadius: 0,
    inside: false,
    rafId: null,
  });

  /* ── RAF tick ─────────────────────────────────────────────── */
  const tick = useCallback(() => {
    const s  = physicsRef.current;
    const el = backLayerRef.current;
    const ct = containerRef.current;

    // 1. Position lerp
    s.cx += (s.tx - s.cx) * LERP_POS;
    s.cy += (s.ty - s.cy) * LERP_POS;

    // 2. Velocity estimation (smoothed delta of target, not current)
    const rawVx = s.tx - s.prevTx;
    const rawVy = s.ty - s.prevTy;
    s.vx += (rawVx - s.vx) * LERP_VEL;
    s.vy += (rawVy - s.vy) * LERP_VEL;
    s.prevTx = s.tx;
    s.prevTy = s.ty;
    const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);

    // 3. Radius: base + velocity bloom, or 0 when cursor left
    const velBonus    = s.inside ? Math.min(speed * 3.2, MAX_VEL_BONUS) : 0;
    s.targetRadius    = s.inside ? BASE_RADIUS + velBonus : 0;
    s.currentRadius  += (s.targetRadius - s.currentRadius) * LERP_RADIUS;

    // 4. Build multi-stop gooey mask
    if (el) {
      const r = s.currentRadius;
      if (r < 0.5) {
        el.style.webkitMaskImage = 'none';
        el.style.maskImage       = 'none';
      } else {
        const mask = [
          `radial-gradient(circle ${r}px at ${s.cx}px ${s.cy}px,`,
          `  black 0%,`,
          `  black 72%,`,
          `  rgba(0,0,0,0.85) 80%,`,
          `  rgba(0,0,0,0.4) 88%,`,
          `  rgba(0,0,0,0.12) 93%,`,
          `  transparent 100%`,
          `)`,
        ].join(' ');
        el.style.webkitMaskImage = mask;
        el.style.maskImage       = mask;
      }
    }

    // 5. 3D parallax tilt — removed to disable the floating effect
    // (Intentionally left blank so cursor-driven parallax tilt doesn't apply)

    s.rafId = requestAnimationFrame(tick);
  }, []);

  /* ── Loop lifecycle ───────────────────────────────────────── */
  useEffect(() => {
    physicsRef.current.rafId = requestAnimationFrame(tick);
    return () => {
      if (physicsRef.current.rafId) cancelAnimationFrame(physicsRef.current.rafId);
    };
  }, [tick]);

  /* ── Pointer handlers ─────────────────────────────────────── */
  const handleMouseEnter = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const s = physicsRef.current;
    s.cx = x; s.cy = y;
    s.tx = x; s.ty = y;
    s.prevTx = x; s.prevTy = y;
    s.vx = 0; s.vy = 0;
    s.inside = true;
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    physicsRef.current.tx     = e.clientX - rect.left;
    physicsRef.current.ty     = e.clientY - rect.top;
    physicsRef.current.inside = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    physicsRef.current.inside = false;
  }, []);

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <>
      {/* SVG Gooey filter */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <defs>
          <filter
            id="mask-gooey"
            x="-30%" y="-30%" width="160%" height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0   0 1 0 0 0   0 0 1 0 0   0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Main container — receives 3D tilt each RAF frame */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position:        'relative',
          width:           '100vw',
          height:          '100vh',
          overflow:        'hidden',
          background:      '#ffffff',
          cursor:          'crosshair',
        }}
      >
        {/* Base layer — front.png */}
        <img
          src={frontImg}
          alt=""
          draggable={false}
          style={{
            position:       'absolute',
            inset:          0,
            width:          '100%',
            height:         '100%',
            objectFit:      'cover',
            objectPosition: 'center center',
            zIndex:         0,
            userSelect:     'none',
            pointerEvents:  'none',
          }}
        />

        {/* Top layer — back.png, revealed by the physics mask + gooey filter */}
        <img
          ref={backLayerRef}
          src={backImg}
          alt=""
          draggable={false}
          style={{
            position:           'absolute',
            inset:              0,
            width:              '100%',
            height:             '100%',
            objectFit:          'cover',
            objectPosition:     'center center',
            zIndex:             10,
            userSelect:         'none',
            pointerEvents:      'none',
            WebkitMaskImage:    'none',
            maskImage:          'none',
            filter:             'url(#mask-gooey)',
            willChange:         'mask-image',
          }}
        />

        {/* Rim glow — trails the blob at its edge, screen-blended */}
        <RimGlow physicsRef={physicsRef} />
      </div>
    </>
  );
}

/* ── Rim Glow ─────────────────────────────────────────────────
 * Reads the same physics ref as MaskReveal.
 * Renders a creamy radial-gradient halo at the blob boundary.
 * mixBlendMode: screen ensures it brightens without tinting.
 */
function RimGlow({ physicsRef }) {
  const glowRef = useRef(null);

  useEffect(() => {
    let rafId;
    function tick() {
      const el = glowRef.current;
      const s  = physicsRef.current;
      if (el) {
        const r    = s.currentRadius;
        const fade = Math.min(r / BASE_RADIUS, 1);
        if (r < 1) {
          el.style.opacity = '0';
        } else {
          const inner = Math.max(r - 44, 0);
          const outer = r + 28;
          const pInner = ((inner / outer) * 100).toFixed(1);
          const pMid   = ((r / outer) * 100).toFixed(1);
          const pOuter = (((r + 14) / outer) * 100).toFixed(1);
          el.style.background = [
            `radial-gradient(circle ${outer}px at ${s.cx}px ${s.cy}px,`,
            `  transparent ${pInner}%,`,
            `  hsla(30,100%,96%,${(0.28 * fade).toFixed(3)}) ${pMid}%,`,
            `  hsla(20,80%,90%,${(0.10 * fade).toFixed(3)}) ${pOuter}%,`,
            `  transparent 100%`,
            `)`,
          ].join(' ');
          el.style.opacity = '1';
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [physicsRef]);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        position:      'absolute',
        inset:         0,
        zIndex:        11,
        pointerEvents: 'none',
        userSelect:    'none',
        mixBlendMode:  'screen',
        opacity:       0,
        willChange:    'background, opacity',
      }}
    />
  );
}
