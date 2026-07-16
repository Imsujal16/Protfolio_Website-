import { useRef, useEffect, useCallback } from 'react';
import frontImg from '../assets/front.png';
import backImg from '../assets/back.png';

/**
 * MaskReveal
 *
 * Full-screen two-image fluid mask reveal.
 *   front.png → base layer (always visible)
 *   back.png  → top layer  (revealed through a physics-eased radial mask)
 *
 * Physics: exponential lerp via requestAnimationFrame.
 * Tuned to feel heavy and fluid ("3D glide").
 */
export default function MaskReveal() {
  const containerRef  = useRef(null);
  const backLayerRef  = useRef(null);

  // Mutable physics state — intentionally NOT React state (no re-renders in RAF)
  const physics = useRef({
    tx: 0, ty: 0,          // cursor target
    cx: 0, cy: 0,          // current eased position
    targetRadius: 0,
    currentRadius: 0,
    rafId: null,
  });

  // Lower = heavier inertia. 0.065 gives a satisfying "3D glide" feel.
  const LERP_POS    = 0.065;
  const LERP_RADIUS = 0.08;

  /* ── RAF tick ──────────────────────────────────────────────────────────── */
  const tick = useCallback(() => {
    const p  = physics.current;
    const el = backLayerRef.current;
    if (!el) { p.rafId = requestAnimationFrame(tick); return; }

    p.cx            += (p.tx - p.cx)                       * LERP_POS;
    p.cy            += (p.ty - p.cy)                       * LERP_POS;
    p.currentRadius += (p.targetRadius - p.currentRadius)  * LERP_RADIUS;

    const r = p.currentRadius;

    if (r < 0.5) {
      el.style.webkitMaskImage = 'none';
      el.style.maskImage       = 'none';
    } else {
      const mask = `radial-gradient(circle ${r}px at ${p.cx}px ${p.cy}px, black 80%, transparent 100%)`;
      el.style.webkitMaskImage = mask;
      el.style.maskImage       = mask;
    }

    p.rafId = requestAnimationFrame(tick);
  }, []);

  /* ── Start / stop loop ─────────────────────────────────────────────────── */
  useEffect(() => {
    physics.current.rafId = requestAnimationFrame(tick);
    return () => {
      if (physics.current.rafId) cancelAnimationFrame(physics.current.rafId);
    };
  }, [tick]);

  /* ── Pointer handlers ──────────────────────────────────────────────────── */
  const handleMouseEnter = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Seed position to avoid the mask flying in from (0,0)
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    physics.current.cx = x;
    physics.current.cy = y;
    physics.current.tx = x;
    physics.current.ty = y;
    physics.current.targetRadius = 250;
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    physics.current.tx = e.clientX - rect.left;
    physics.current.ty = e.clientY - rect.top;
    physics.current.targetRadius = 250;
  }, []);

  const handleMouseLeave = useCallback(() => {
    physics.current.targetRadius = 0;
  }, []);

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width:    '100vw',
        height:   '100vh',
        overflow: 'hidden',
        background: '#ffffff',
        cursor: 'crosshair',
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

      {/* Top layer — back.png, revealed by the physics mask */}
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
        }}
      />
    </div>
  );
}
