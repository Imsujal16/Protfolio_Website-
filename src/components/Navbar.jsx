/**
 * Navbar.jsx — Three independent floating liquid-metal pills.
 *
 * Structure (left → center → right):
 *   [SJ]    [About · Skills · Projects · Experience · Contact]    [Resume ↗]
 *
 * Each desktop pill is wrapped in <GlowingBorderButton> which renders an
 * animated liquid-metal shader border via @paper-design/shaders. The inner
 * fill is a dark gradient (#202020 → #000), so all text is light-colored.
 *
 * pointer-events: none on the wrapper ensures clicks in the transparent gaps
 * between pills fall through to the hero canvas below.
 *
 * Mobile: logo pill (left) | hamburger pill (center) | resume pill (right)
 *         + fixed mobile panel below.
 *         The hamburger pill stays as CSS glass (no shader) to avoid
 *         unnecessary WebGL cost on mobile.
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

/* Thin-stroke northeast arrow — Lucide aesthetic */
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

  /* Escape key closes mobile panel */
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

  /* Lock body scroll when mobile panel is open */
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
      {/* ── Transparent wrapper — no background, no border, no blur ── */}
      <header className={wrapperClass} role="banner">

        {/* ① Logo pill — liquid-metal border, 44×44 circle
              Inner fill is dark (#202020→#000), so "SJ" is white.
              borderRadius: "100px" on a 44×44 box = perfect circle. */}
        <GlowingBorderButton
          width={44}
          height={44}
          borderRadius="100px"
          /* Override inner fill to be slightly lighter so SJ monogram reads */
          innerFrom="#2a2a2a"
          innerTo="#111111"
          innerMargin={2}
          /* Outer div gets the CSS module's positioning */
          className={styles.logoPill}
          /* Remove old CSS glass — GlowingBorderButton provides the border */
          style={{ position: 'absolute', left: 0 }}
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
              color:          'rgba(230,230,230,0.90)',
              fontSize:       '13px',
              fontWeight:     300,
              letterSpacing:  '0.04em',
              lineHeight:     1,
              userSelect:     'none',
              borderRadius:   'inherit',
            }}
          >
            SJ
          </a>
        </GlowingBorderButton>

        {/* ② Nav links pill — liquid-metal border, auto-width
              width="auto" → GlowingBorderButton uses inline-flex + ResizeObserver.
              Absolutely centered via CSS class.
              Each <a> link remains a real anchor — click/scroll behavior preserved.
              Text is light (rgba(200,200,200,0.85)) to show against dark fill. */}
        <GlowingBorderButton
          width="auto"
          height={44}
          borderRadius="100px"
          innerMargin={2}
          className={styles.linksPillShader}
          contentStyle={{
            gap:    '2px',
            padding: '0 10px',
          }}
        >
          <nav aria-label="Site sections" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className={styles.navLinkShader}
              >
                {label}
              </a>
            ))}
          </nav>
        </GlowingBorderButton>

        {/* ② Hamburger pill — mobile only, stays CSS glass (no shader) */}
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

        {/* ③ Resume pill — liquid-metal border, fixed width
              Stays as an <a> link wrapping the content so href/target work.
              Arrow icon preserved. Text light for dark-fill contrast. */}
        <GlowingBorderButton
          width={130}
          height={44}
          borderRadius="100px"
          innerMargin={2}
          className={styles.resumePillShader}
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
              color:          'rgba(210, 210, 210, 0.90)',
              fontSize:       '13.5px',
              fontWeight:     500,
              letterSpacing:  '-0.01em',
              whiteSpace:     'nowrap',
              borderRadius:   'inherit',
            }}
          >
            <span>Resume</span>
            <ArrowUpRight />
          </a>
        </GlowingBorderButton>

      </header>

      {/* ── Mobile panel — fixed, independent of the wrapper ── */}
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
