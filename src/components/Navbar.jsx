/**
 * Navbar.jsx — Three independent floating liquid-metal pills.
 *
 * Structure (left → center → right):
 *   [SJ]    [About · Skills · Projects · Experience · Contact]    [Resume ↗]
 *
 * Each desktop pill uses GlowingBorderButton — an animated liquid-metal
 * shader border from @paper-design/shaders. The inner fill is dark
 * (#202020 → #000), so all text is light-colored.
 *
 * GlowingBorderButton renders a plain <div>. Positioning is handled via
 * its style prop (passed as a spread), so the CSS module class is only
 * used for the centered nav pill's absolute positioning.
 *
 * Mobile: hamburger pill (center) — CSS glass only, no shader.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useScrolled } from '../hooks/useScrolled';
import { GlowingBorderButton } from './GlowingBorderButton';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'About',      href: '#about'      },
  { label: 'Skills',     href: '#skills'      },
  { label: 'Projects',   href: '#projects'    },
  { label: 'Experience', href: '#experience'  },
  { label: 'Contact',    href: '#contact'     },
];

/* Thin-stroke northeast arrow */
function ArrowUpRight() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, transition: 'transform 0.24s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <path
        d="M2 9L9 2M9 2H3.5M9 2V7.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Three horizontal lines → X morph */
function MenuIcon({ open }) {
  return (
    <span className={styles.menuIcon} aria-hidden="true">
      <span className={`${styles.bar} ${open ? styles.barTop : ''}`} />
      <span className={`${styles.bar} ${open ? styles.barMid : ''}`} />
      <span className={`${styles.bar} ${open ? styles.barBot : ''}`} />
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── */

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const scrolled        = useScrolled(20);
  const triggerRef      = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const closeMenu = useCallback(() => setOpen(false), []);

  const wrapperClass = [
    styles.navbar,
    scrolled ? styles.scrolled : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <header className={wrapperClass} role="banner">

        {/* ① LOGO PILL — 44×44 circle, far left in flex row */}
        <GlowingBorderButton
          width={44}
          height={44}
          borderRadius="100px"
          innerMargin={2}
          style={{ flexShrink: 0 }}
        >
          <a
            href="/"
            aria-label="SJ — home"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '100%',
              height:         '100%',
              textDecoration: 'none',
              color:          'rgba(225, 225, 225, 0.92)',
              fontSize:       '13px',
              fontWeight:     300,
              letterSpacing:  '0.04em',
              lineHeight:     1,
              userSelect:     'none',
            }}
          >
            SJ
          </a>
        </GlowingBorderButton>

        {/* ② NAV LINKS PILL — auto-width, absolutely centered */}
        {/*   position:absolute + left:50% lives on the outer GlowingBorderButton div */}
        {/*   via the style prop so it correctly overrides the component's default    */}
        <GlowingBorderButton
          width="auto"
          height={44}
          borderRadius="100px"
          innerMargin={2}
          style={{
            position:  'absolute',
            left:      '50%',
            transform: 'translateX(-50%)',
          }}
          contentStyle={{ padding: '0 10px', gap: '2px' }}
        >
          <nav aria-label="Site sections" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className={styles.navLinkShader}>
                {label}
              </a>
            ))}
          </nav>
        </GlowingBorderButton>

        {/* ② HAMBURGER PILL — mobile only, CSS glass */}
        <button
          ref={triggerRef}
          className={`${styles.hamburgerPill} ${open ? styles.hamburgerOpen : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          type="button"
        >
          <span className={styles.shine} aria-hidden="true" />
          <MenuIcon open={open} />
        </button>

        {/* ③ RESUME PILL — fixed 130×44, far right in flex row */}
        <GlowingBorderButton
          width={130}
          height={44}
          borderRadius="100px"
          innerMargin={2}
          style={{
            flexShrink: 0,
            transition: 'transform 0.26s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View resume (opens in new tab)"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '5px',
              width:          '100%',
              height:         '100%',
              textDecoration: 'none',
              color:          'rgba(215, 215, 215, 0.92)',
              fontSize:       '13.5px',
              fontWeight:     500,
              letterSpacing:  '-0.01em',
              whiteSpace:     'nowrap',
            }}
          >
            <span>Resume</span>
            <ArrowUpRight />
          </a>
        </GlowingBorderButton>

      </header>

      {/* ── Mobile panel ── */}
      <div
        id="mobile-nav-panel"
        className={`${styles.mobilePanel} ${open ? styles.mobilePanelOpen : ''}`}
        aria-hidden={!open}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <span className={styles.shine} aria-hidden="true" />
        <nav className={styles.mobileList}>
          {NAV_LINKS.map(({ label, href }, i) => (
            <a
              key={label}
              href={href}
              className={styles.mobileLink}
              onClick={closeMenu}
              style={{ '--i': i }}
            >
              {label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileCta}
            onClick={closeMenu}
            style={{ '--i': NAV_LINKS.length }}
          >
            Resume ↗
          </a>
        </nav>
      </div>
    </>
  );
}
