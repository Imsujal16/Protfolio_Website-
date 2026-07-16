/**
 * GlowingBorderButton.jsx
 *
 * Liquid-metal animated shader border using @paper-design/shaders.
 *
 * Two sizing modes:
 *   Fixed:  width={44} height={44}  → exact pixel size
 *   Auto:   width="auto"            → wrapper uses display:inline-flex,
 *                                     grows to fit children naturally
 *
 * The inner fill is a dark gradient (#202020 → #000) so text
 * should be light-colored (handled by the consumer).
 *
 * All extra props (className, style, onClick, aria-*, etc.)
 * are forwarded to the outer wrapper div.
 */

import { useRef, useEffect, useLayoutEffect, useCallback } from 'react';

/* Inject canvas sizing rules once globally */
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

export function GlowingBorderButton({
  children,
  width = 'auto',
  height = 44,
  borderRadius = '100px',
  innerMargin = 2,
  innerFrom = '#202020',
  innerTo   = '#000000',
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
  contentStyle,
  contentClassName,
  className,
  style: styleProp,
  ...rest
}) {
  const outerRef  = useRef(null);
  const shaderRef = useRef(null);
  const mountRef  = useRef(null);

  const isAutoWidth = width === 'auto';

  /* ── Boot shader (async import keeps initial bundle lean) ─── */
  const initShader = useCallback(async () => {
    if (!shaderRef.current) return;
    if (mountRef.current?.destroy) {
      mountRef.current.destroy();
      mountRef.current = null;
    }
    const { liquidMetalFragmentShader, ShaderMount } = await import('@paper-design/shaders');
    if (!shaderRef.current) return;
    mountRef.current = new ShaderMount(
      shaderRef.current,
      liquidMetalFragmentShader,
      shaderParams,
      undefined,
      speed,
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    ensureGlobalStyle();
    initShader();
    return () => {
      if (mountRef.current?.destroy) mountRef.current.destroy();
      mountRef.current = null;
    };
  }, [initShader]);

  /* ── Auto-width: nudge ShaderMount on resize ─────────────── */
  useLayoutEffect(() => {
    if (!isAutoWidth) return;
    const outer = outerRef.current;
    if (!outer) return;
    const ro = new ResizeObserver(() => {
      mountRef.current?.setSize?.(outer.clientWidth, outer.clientHeight);
    });
    ro.observe(outer);
    return () => ro.disconnect();
  }, [isAutoWidth]);

  /* ── Outer wrapper style ─────────────────────────────────── */
  const outerStyle = {
    position:    'relative',
    overflow:    'hidden',
    borderRadius,
    /* sizing */
    ...(isAutoWidth
      ? {
          display: 'inline-flex',
          alignItems: 'center',
          height: typeof height === 'number' ? `${height}px` : height,
        }
      : {
          display: 'block',
          width:   typeof width  === 'number' ? `${width}px`  : width,
          height:  typeof height === 'number' ? `${height}px` : height,
        }
    ),
    /* caller overrides last so they win over the defaults above */
    ...styleProp,
  };

  /* ── Inner dark fill (2px inset reveals the shader border) ── */
  const innerStyle = {
    position:       'absolute',
    inset:          `${innerMargin}px`,
    zIndex:         10,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius,
    background:     `linear-gradient(to bottom, ${innerFrom}, ${innerTo})`,
    pointerEvents:  'auto',
    ...contentStyle,
  };

  return (
    <div ref={outerRef} className={className} style={outerStyle} {...rest}>
      {/* Animated shader border layer */}
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

      {/* Dark inner fill */}
      <div style={innerStyle} className={contentClassName}>
        {children}
      </div>
    </div>
  );
}
