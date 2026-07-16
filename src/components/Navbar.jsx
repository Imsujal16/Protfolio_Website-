/**
 * Navbar.jsx — Three independent floating glass pills.
 *
 * Structure (left → center → right):
 *   [SJ]    [About · Skills · Projects · Experience · Contact]    [Resume ↗]
 *
 * Each element is a completely separate DOM node with its own
 * backdrop-filter surface. The wrapper is 100% transparent —
 * only the pills themselves have glass styling.
 *
 * pointer-events: none on the wrapper ensures clicks in the
 * transparent gaps between pills pass through to the hero below.
 *
 * Mobile: logo pill (left) | hamburger pill (center) | resume pill (right)
 *         + fixed mobile panel drops below
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useScrolled } from '../hooks/useScrolled';
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
      className={styles.ctaArrow}
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

        {/* ① Logo pill — far left, independent glass surface */}
        <a href="/" className={styles.logoPill} aria-label="SJ — home">
          {/* Refraction line sits at top of each pill */}
          <span className={styles.shine} aria-hidden="true" />
          <span className={styles.sjText}>SJ</span>
        </a>

        {/* ② Nav links pill — absolutely centered, desktop only */}
        <nav
          className={styles.linksPill}
          aria-label="Site sections"
        >
          <span className={styles.shine} aria-hidden="true" />
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className={styles.navLink}>
              {label}
            </a>
          ))}
        </nav>

        {/* ② Hamburger pill — absolutely centered, mobile only */}
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

        {/* ③ Resume pill — far right, independent glass surface */}
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.resumePill}
          aria-label="View resume (opens in new tab)"
        >
          <span className={styles.shine} aria-hidden="true" />
          <span>Resume</span>
          <ArrowUpRight />
        </a>

      </header>

      {/* ── Mobile panel — fixed, independent of the wrapper ── */}
      {/*
        * Positioned with fixed coords so it sits just below the pills.
        * Independent from the navbar wrapper so it can't affect
        * the transparent gaps between pills.
        */}
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
