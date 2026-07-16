/**
 * GlowingBorderButton.jsx
 *
 * Liquid-metal shader border effect using @paper-design/shaders.
 *
 * Supports two sizing modes:
 *   Fixed:  pass numeric width + height → outer wrapper is exactly that size
 *   Auto:   pass width="auto" (default) → wrapper is display:inline-flex,
 *           grows to fit children; ResizeObserver keeps canvas in sync.
 *
 * The dark inner fill (#202020 → #000) is intentional — content text should
 * be light. Pass textColor prop to override (default: rgba(200,200,200,0.85)).
 *
 * Usage:
 *   <GlowingBorderButton width={44} height={44}>SJ</GlowingBorderButton>
 *   <GlowingBorderButton width="auto" height={44}>…links…</GlowingBorderButton>
 */

import { useRef, useEffect, useLayoutEffect, useCallback } from 'react';

/* Inject canvas sizing styles once into <head> */
function ensureGlobalStyle() {
  if (document.getElementById('gbb-shader-style')) return;
  const style = document.createElement('style');
  style.id = 'gbb-shader-style';
  style.textContent = `
    .gbb-shader-container canvas {
      width: 100% !important;
      height: 100% !important;
      display: block !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
    }
  `;
  document.head.appendChild(style);
}

/* ── Component ──────────────────────────────────────────────── */

export function GlowingBorderButton({
  children,
  /* Sizing: fixed numeric px OR "auto" to size-to-content */
  width = 'auto',
  height = 44,
  /* Visual tweaks */
  borderRadius = '100px',
  innerMargin = 2,
  /* Inner-fill gradient — dark by default for contrast with liquid-metal */
  innerFrom = '#202020',
  innerTo   = '#000000',
  /* Shader params — matches the reference implementation */
  shaderParams = {
    u_repetition: 4,
    u_softness:   0.5,
    u_shiftRed:   0.3,
    u_shiftBlue:  0.3,
    u_distortion: 0,
    u_contour:    0,
    u_angle:      45,
    u_scale:      8,
    u_shape:      1,
    u_offsetX:    0.1,
    u_offsetY:    -0.1,
  },
  speed = 0.6,
  /* Pass-through to the inner content wrapper */
  contentStyle,
  contentClassName,
  children: _children,
  ...rest
}) {
  const outerRef  = useRef(null);  /* the outermost sizing div */
  const shaderRef = useRef(null);  /* the shader mount target div */
  const mountRef  = useRef(null);  /* ShaderMount instance */

  const isAutoWidth = width === 'auto';

  /* ── Boot shader ─────────────────────────────────────────── */
  const initShader = useCallback(async () => {
    if (!shaderRef.current) return;
    /* Destroy previous instance if re-initialising */
    if (mountRef.current?.destroy) {
      mountRef.current.destroy();
      mountRef.current = null;
    }
    const { liquidMetalFragmentShader, ShaderMount } = await import('@paper-design/shaders');
    if (!shaderRef.current) return; /* guard against unmount during async */
    mountRef.current = new ShaderMount(
      shaderRef.current,
      liquidMetalFragmentShader,
      shaderParams,
      undefined,
      speed,
    );
  }, []); /* stable — shaderParams are initialisation-time only */

  /* ── Mount / unmount ─────────────────────────────────────── */
  useEffect(() => {
    ensureGlobalStyle();
    initShader();
    return () => {
      if (mountRef.current?.destroy) mountRef.current.destroy();
      mountRef.current = null;
    };
  }, [initShader]);

  /* ── Auto-width: sync canvas size on every resize ────────── */
  useLayoutEffect(() => {
    if (!isAutoWidth) return;
    const outer = outerRef.current;
    if (!outer) return;
    const ro = new ResizeObserver(() => {
      /* ShaderMount reads the div's clientWidth/clientHeight automatically,
         but we may need to trigger a resize event if it doesn't auto-update. */
      mountRef.current?.setSize?.(outer.clientWidth, outer.clientHeight);
    });
    ro.observe(outer);
    return () => ro.disconnect();
  }, [isAutoWidth]);

  /* ── Outer sizing styles ─────────────────────────────────── */
  const outerStyle = isAutoWidth
    ? {
        display:      'inline-flex',
        position:     'relative',
        overflow:     'hidden',
        height:       typeof height === 'number' ? `${height}px` : height,
        borderRadius,
      }
    : {
        display:      'block',
        position:     'relative',
        overflow:     'hidden',
        width:        typeof width  === 'number' ? `${width}px`  : width,
        height:       typeof height === 'number' ? `${height}px` : height,
        borderRadius,
      };

  /* ── Inner fill styles ───────────────────────────────────── */
  const innerStyle = {
    position:       'absolute',
    inset:          `${innerMargin}px`,
    zIndex:         10,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius,
    background:     `linear-gradient(to bottom, ${innerFrom}, ${innerTo})`,
    /* Pointer events must stay on for links/buttons inside */
    pointerEvents:  'auto',
    ...contentStyle,
  };

  return (
    <div ref={outerRef} style={outerStyle} {...rest}>
      {/* Shader layer — z:0, behind inner fill */}
      <div
        ref={shaderRef}
        className="gbb-shader-container"
        style={{
          position:      'absolute',
          inset:         0,
          zIndex:        0,
          borderRadius,
          pointerEvents: 'none',
        }}
      />

      {/* Dark inner fill — clips 2px inward to reveal shader border */}
      <div style={innerStyle} className={contentClassName}>
        {children}
      </div>
    </div>
  );
}
