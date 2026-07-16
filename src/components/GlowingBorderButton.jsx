/**
 * GlowingBorderButton.jsx
 *
 * Liquid-metal animated shader border using @paper-design/shaders.
 *
 * Layout (back → front):
 *   [0] shader canvas  — position:absolute inset:0      (z:0, pointer-events:none)
 *   [1] dark fill      — position:absolute inset:2px    (z:1, pointer-events:none)
 *   [2] content        — IN-FLOW, position:relative     (z:2)
 *
 * The outer wrapper uses `padding: innerMargin` so the in-flow content
 * is inset from the edges. This means the outer div's natural size
 * always equals content size + (2 * innerMargin), which:
 *   - Correctly sizes the div in auto-width (display:inline-flex) mode
 *   - Correctly reveals the shader border ring around the content
 *
 * Fixed mode  (width={n})  → explicit px size, content centers via flexbox
 * Auto  mode  (width="auto") → outer grows with content naturally
 */

import { useRef, useEffect, useLayoutEffect, useCallback } from 'react';

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
  /* Inner styles (frosted glass) */
  innerBackground = 'rgba(20, 20, 20, 0.15)',
  shaderParams = {
    u_repetition: 4,
    u_softness:   0.5,
    u_shiftRed:   0.3,
    u_shiftBlue:  0.3,
    u_distortion: 0,
    u_contour:    0,
    u_angle:      45,
    u_scale:      8,
    u_shape:      0, // 0 = none/fill, 1 = circle. We want it to fill so CSS border-radius can mask it into a pill!
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

  const initShader = useCallback(async () => {
    const outer = outerRef.current;
    if (!shaderRef.current || !outer) return;

    if (mountRef.current?.dispose) {
      mountRef.current.dispose();
      mountRef.current = null;
    }

    const { liquidMetalFragmentShader, ShaderMount } = await import('@paper-design/shaders');
    if (!shaderRef.current || !outer) return;

    console.log(`[ShaderMount] Initializing on wrapper size: ${outer.clientWidth}x${outer.clientHeight}`);

    mountRef.current = new ShaderMount(
      shaderRef.current,
      liquidMetalFragmentShader,
      shaderParams,
      undefined,
      speed,
    );

    // Explicitly set the canvas drawing buffer to match the wrapper's real size * devicePixelRatio
    // This fixes the bug where CSS width:100% stretches a too-small canvas buffer.
    const canvas = shaderRef.current.querySelector('canvas');
    if (canvas) {
      console.log(`[ShaderMount] Canvas size right after init: ${canvas.width}x${canvas.height}`);
      
      const dpr = window.devicePixelRatio || 1;
      const expectedWidth = outer.clientWidth * dpr;
      const expectedHeight = outer.clientHeight * dpr;
      
      if (canvas.width !== expectedWidth || canvas.height !== expectedHeight) {
        canvas.width = expectedWidth;
        canvas.height = expectedHeight;
        console.log(`[ShaderMount] Canvas size corrected to: ${canvas.width}x${canvas.height}`);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    ensureGlobalStyle();
    return () => {
      if (mountRef.current?.dispose) mountRef.current.dispose();
      mountRef.current = null;
    };
  }, []);

  /* ── ResizeObserver to fix Bug 1 (Shader Canvas Resizing) ── */
  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    
    let lastWidth = 0;
    let lastHeight = 0;

    const ro = new ResizeObserver(() => {
      const currentWidth = outer.clientWidth;
      const currentHeight = outer.clientHeight;
      
      // Only re-init if the dimensions actually changed
      if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
        lastWidth = currentWidth;
        lastHeight = currentHeight;
        
        console.log(`[ResizeObserver] Wrapper measured at ${currentWidth}x${currentHeight}. Re-initializing shader...`);
        // We call initShader on resize, which disposes the old one and makes a new one with correct size
        initShader();
      }
    });
    
    // ro.observe triggers immediately upon observation, handling the initial mount
    // AFTER the layout measurement is complete.
    ro.observe(outer);
    
    return () => ro.disconnect();
  }, [initShader]);

  const isAutoWidth = width === 'auto';
  const m = `${innerMargin}px`;

  /*
   * Outer wrapper style.
   * KEY: padding:innerMargin creates the visual border gap (revealed shader ring).
   * Content is IN-FLOW so the wrapper measures it correctly for auto-width.
   */
  const outerStyle = {
    /* Stacking context for the absolute shader/fill layers */
    position:    'relative',
    overflow:    'hidden',
    borderRadius,
    /* Padding creates the inset gap that reveals the shader border */
    padding:     m,
    /* Layout */
    display:     'inline-flex',
    alignItems:  'center',
    justifyContent: 'center',
    flexShrink:  0,
    boxSizing:   'border-box',
    /* Explicit size for fixed mode */
    ...(isAutoWidth
      ? { height: typeof height === 'number' ? `${height}px` : height }
      : {
          width:  typeof width  === 'number' ? `${width}px`  : width,
          height: typeof height === 'number' ? `${height}px` : height,
        }
    ),
    /* Caller overrides win */
    ...styleProp,
  };

  return (
    <div ref={outerRef} className={className} style={outerStyle} {...rest}>

      {/* [0] Animated shader border — fills entire outer including padding zone */}
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

      {/* [1] Frosted glass inner fill (Fix for Bug 2) */}
      <div
        style={{
          position:      'absolute',
          inset:         m,
          zIndex:        1,
          borderRadius:  `calc(${borderRadius} - ${m})`,
          background:    innerBackground,
          backdropFilter: 'blur(10px) saturate(180%)',
          WebkitBackdropFilter: 'blur(10px) saturate(180%)',
          pointerEvents: 'none',
        }}
      />

      {/* [2] Content — in-flow, above both absolute layers */}
      <div
        style={{
          position:       'relative',
          zIndex:         2,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          width:          '100%',
          pointerEvents:  'auto',
          textShadow:     '0 1px 2px rgba(0,0,0,0.4)', /* Fix text legibility over frosted glass */
          ...contentStyle,
        }}
        className={contentClassName}
      >
        {children}
      </div>

    </div>
  );
}
