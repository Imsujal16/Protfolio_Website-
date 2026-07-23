/**
 * AboutSection.jsx — v3 (Motion & Polish)
 *
 * Design system:
 *   --warm:  hsl(340, 70%, 60%)
 *   --cool:  hsl(195, 80%, 55%)
 *   Background: #ffffff + ambient animated orb layer (CSS)
 *   Font: Inter / DM Sans (body), JetBrains Mono (meta/kicker)
 *
 * Animation system (GSAP — already installed):
 *   1. Word-by-word headline curtain reveal (existing, unchanged)
 *   2. Sub-line chip reveal (existing, unchanged)
 *   3. Body paragraphs — fade + rise via useSectionReveal
 *   4. Photo slot — soft scale + fade entrance on scroll
 *   5. Location badge — delayed fade + slide-up after photo
 *   6. Edu items — staggered fade-rise (80ms apart)
 *   7. Cert cards — staggered fade-rise (100ms apart)
 *   8. Parallax orb background — CSS var updated on scroll
 *   9. Visibility toggle — adds .about-section--visible class to
 *      activate CSS orb animations only when in viewport
 */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSectionReveal } from '../hooks/useSectionReveal';
import LiquidHover from './LiquidHover';
import AnimatedWordDesign from './AnimatedWordDesign';
import AnimatedWordCode from './AnimatedWordCode';
import './AboutSection.css';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Data ──────────────────────────────────────────────────────────────────────

const education = [
  {
    institution: 'BML Munjal University',
    degree: 'B.Tech Computer Science Engineering',
    meta: '2024 – 2028 · CGPA 7.32',
  },
  {
    institution: 'Kamla Nehru Bal Shiksha Sansthan',
    degree: '12th CBSE · Science · Sultanpur',
    meta: '2023 · 73.4%',
  },
  {
    institution: 'Kamla Nehru Bal Shiksha Sansthan',
    degree: '10th CBSE · Sultanpur',
    meta: '2021 · 82.2%',
  },
];

const certifications = [
  { title: 'Coursera Certified',     sub: 'Work with Components in Figma'    },
  { title: 'VentureX Internship',    sub: 'Tech Intern · Frontend Developer'  },
  { title: 'DSA Training',           sub: 'CodeHelp Supreme Batch · Jan 2026' },
  { title: 'C Programming Training', sub: 'LNIT · Sep–Dec 2023'              },
];

const HEADLINE_WORDS = [
  'Building', 'at', 'the', 'intersection', 'of', 'design', '&', 'code',
];

const SUBLINE_CHIPS = [
  'Hey!', "I'm", 'Sujal', 'Jaiswal', '—', 'a', 'Computer', 'Science', 'student', 'at', 'BML', 'Munjal', 'University', "who's", 'obsessed', 'with', 'building', 'things', 'that', 'actually', 'work,', 'and', 'making', 'them', 'look good', 'while', "they're", 'at', 'it.'
];

export default function AboutSection() {
  const sectionRef    = useSectionReveal('.js-about', {
    variant:  'fade-rise',
    stagger:  0.10,
    start:    'top 80%',
    duration: 0.85,
    ease:     'power3.out',
  });

  const headlineRef  = useRef(null);
  const sublineRef   = useRef(null);
  const photoRef     = useRef(null);
  const badgeRef     = useRef(null);
  const eduItemsRef  = useRef(null);
  const certCardsRef = useRef(null);
  const orbsRef      = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /* ── Parallax + visibility toggle ─────────────────────────── */
    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      const inView = rect.top < viewH && rect.bottom > 0;

      // Toggle orb animation (CSS class)
      section.classList.toggle('about-section--visible', inView);

      // Parallax: move orbs at 30% of scroll speed
      if (inView && orbsRef.current) {
        const progress = (viewH - rect.top) / (viewH + rect.height);
        const offset   = (progress - 0.5) * -60; // -30px → +30px range
        orbsRef.current.style.setProperty('--about-parallax', `${offset}`);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on mount

    /* ── Reduced-motion: show everything instantly ─────────────── */
    if (REDUCED_MOTION()) {
      const allWords = section.querySelectorAll('.about-word-inner, .about-chip-inner');
      gsap.set(allWords, { y: 0, opacity: 1 });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const ctx = gsap.context(() => {

      /* 1 ── Headline word-by-word curtain reveal */
      const headlineWords = headlineRef.current?.querySelectorAll('.about-word-inner') ?? [];
      if (headlineWords.length) {
        gsap.set(headlineWords, { y: '108%', opacity: 0 });
        gsap.to(headlineWords, {
          y: '0%', opacity: 1,
          duration: 0.75, ease: 'power3.out', stagger: 0.065,
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 82%', once: true,
          },
        });
      }

      /* 2 ── Sub-line chip reveal */
      const chips = sublineRef.current?.querySelectorAll('.about-chip-inner') ?? [];
      if (chips.length) {
        gsap.set(chips, { y: '110%', opacity: 0 });
        gsap.to(chips, {
          y: '0%', opacity: 1,
          duration: 0.6, ease: 'power3.out', stagger: 0.04, delay: 0.2,
          scrollTrigger: {
            trigger: sublineRef.current,
            start: 'top 82%', once: true,
          },
        });
      }

      /* 3 ── Photo slot: scale-up entrance */
      if (photoRef.current) {
        gsap.set(photoRef.current, { scale: 0.94, opacity: 0, y: 24 });
        gsap.to(photoRef.current, {
          scale: 1, opacity: 1, y: 0,
          duration: 0.75, ease: 'power3.out',
          scrollTrigger: {
            trigger: photoRef.current,
            start: 'top 85%', once: true,
          },
        });
      }

      /* 4 ── Location badge: slides in after photo */
      if (badgeRef.current) {
        gsap.set(badgeRef.current, { opacity: 0, y: 12, scale: 0.88 });
        gsap.to(badgeRef.current, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.5, ease: 'back.out(1.8)', delay: 0.4,
          scrollTrigger: {
            trigger: photoRef.current,
            start: 'top 85%', once: true,
          },
        });
      }

      /* 5 ── Education items: staggered fade-rise (80ms apart) */
      const eduItems = eduItemsRef.current?.querySelectorAll('.about-edu__item') ?? [];
      if (eduItems.length) {
        gsap.set(eduItems, { opacity: 0, y: 20 });
        gsap.to(eduItems, {
          opacity: 1, y: 0,
          duration: 0.6, ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: eduItemsRef.current,
            start: 'top 82%', once: true,
          },
        });
      }

      /* 6 ── Cert cards: staggered fade-rise (100ms apart) */
      const certCards = certCardsRef.current?.querySelectorAll('.about-cert-card') ?? [];
      if (certCards.length) {
        gsap.set(certCards, { opacity: 0, y: 24 });
        gsap.to(certCards, {
          opacity: 1, y: 0,
          duration: 0.55, ease: 'power2.out',
          stagger: 0.10,
          scrollTrigger: {
            trigger: certCardsRef.current,
            start: 'top 85%', once: true,
          },
        });
      }

    });

    return () => {
      ctx.revert();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="about-section"
      aria-labelledby="about-heading"
    >
      {/* ── Ambient orb background ────────────────────────────── */}
      <div ref={orbsRef} className="about-bg-orbs" aria-hidden="true">
        <div className="about-orb about-orb--warm" />
        <div className="about-orb about-orb--cool" />
        <div className="about-orb about-orb--mid"  />
      </div>

      {/* ══ BLOCK 1 — Headline ════════════════════════════════════ */}
      <div className="about-headline-block">
        <h2
          id="about-heading"
          ref={headlineRef}
          className="about-headline"
          aria-label="Building at the intersection of design & code"
        >
          {HEADLINE_WORDS.map((word, i) => (
            <span key={i} className="about-word-curtain">
              <span className="about-word-inner">
                {word === 'design' ? (
                  <AnimatedWordDesign word="design" />
                ) : word === 'code' ? (
                  <AnimatedWordCode word="code" />
                ) : (
                  word
                )}
              </span>
            </span>
          ))}
        </h2>

        <p
          ref={sublineRef}
          className="about-subline"
          aria-label="Hey! I'm Sujal Jaiswal — a Computer Science student at BML Munjal University who's obsessed with building things that actually work, and making them look good while they're at it."
        >
          {SUBLINE_CHIPS.map((chip, i) => {
            const isHighlight = chip === 'obsessed' || chip === 'look good';
            return (
              <span key={i} className={`about-chip-curtain ${isHighlight ? 'about-chip-curtain--highlight' : ''}`}>
                <span className={`about-chip-inner ${isHighlight ? 'about-chip-inner--highlight' : ''}`}>
                  {chip}
                </span>
              </span>
            );
          })}
        </p>
      </div>

      {/* ══ BLOCK 2 — Body copy ═══════════════════════════════════ */}
      <div className="about-body-block js-about">
        <p className="about-body-para">
          My world lives at the intersection of{' '}
          <strong className="about-em">beautiful design</strong> and{' '}
          <strong className="about-em">robust engineering</strong>. Whether
          it&rsquo;s architecting a full-stack marketplace platform or crafting
          pixel-perfect UI components, I bring the same level of obsession to both.
        </p>

        <p className="about-body-para about-body-para--spaced js-about">
          I learn by <strong className="about-em">building in public</strong>. Every
          project is an experiment, every experiment teaches me something new. Currently
          exploring AI integration, scalable system design, and the art of delightful
          user experiences.
        </p>
      </div>

      {/* ══ BLOCK 3 — Education + Certifications ═════════════════ */}
      <div className="about-lower-grid">

        {/* ── LEFT: Photo ───────────────────────────────────────── */}
        <div className="about-photo-col">
          <div
            ref={photoRef}
            className="about-photo-slot"
            role="img"
            aria-label="Photo of Sujal Jaiswal"
            style={{ border: 'none', background: 'transparent' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
              }}
            >
              <LiquidHover
                imageSrc="/profile-photo.png"
                cursorSize={280}
                intensity={30}
                resolution={10}
              />
            </div>

            {/* Location badge */}
            <div ref={badgeRef} className="about-location-badge">
              <span className="about-location-badge__icon" aria-hidden="true">📍</span>
              Gurugram, India
            </div>
          </div>
        </div>

        {/* ── RIGHT: Education & Certs ──────────────────────────── */}
        <div className="about-text-col">

          {/* Education timeline */}
          <div ref={eduItemsRef} className="about-edu" aria-label="Education">
            <p className="about-edu__kicker">EDUCATION</p>
            <ol className="about-edu__list">
              {education.map((entry, i) => (
                <li
                  key={i}
                  className="about-edu__item"
                >
                  <h3 className="about-edu__institution">{entry.institution}</h3>
                  <p className="about-edu__degree">{entry.degree}</p>
                  <p className="about-edu__meta">{entry.meta}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Certifications grid */}
          <div className="about-cert-section" aria-label="Certifications">
            <p className="about-edu__kicker">CERTIFICATIONS</p>
            <div ref={certCardsRef} className="about-cert-grid">
              {certifications.map((cert) => (
                <article
                  key={cert.title}
                  className="about-cert-card"
                >
                  <h3 className="about-cert-title">{cert.title}</h3>
                  <p className="about-cert-sub">{cert.sub}</p>
                </article>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
