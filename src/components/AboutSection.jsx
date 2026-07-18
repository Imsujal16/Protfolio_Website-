/**
 * AboutSection.jsx — Real content implementation
 *
 * Design system:
 *   --warm:  hsl(340, 70%, 60%)  — pink/magenta accent (mirrors "designer." Hero panel)
 *   --cool:  hsl(195, 80%, 55%)  — cyan accent (mirrors "<coder/>" Hero panel)
 *   Background: #ffffff (matches body)
 *   Font: Inter / DM Sans (body), JetBrains Mono (meta/kicker)
 *
 * Animation system:
 *   All reveals route through the shared useSectionReveal hook.
 *   The headline word-reveal is a bespoke GSAP stagger (no new hook variant needed —
 *   it's just a scoped gsap.from() inside the component's own useEffect, respecting
 *   the same reduced-motion guard and timing family as the hook).
 *
 * Photo slot:
 *   Clearly marked as [SWAPPABLE PHOTO]. Replace the <div class="about-photo-placeholder">
 *   block with <img src={yourPhoto} alt="Sujal Jaiswal" className="about-photo" />.
 */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSectionReveal } from '../hooks/useSectionReveal';
import LiquidHover from './LiquidHover';
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
  { title: 'Coursera Certified',      sub: 'Work with Components in Figma'       },
  { title: 'VentureX Internship',     sub: 'Tech Intern · Frontend Developer'    },
  { title: 'DSA Training',            sub: 'CodeHelp Supreme Batch · Jan 2026'   },
  { title: 'C Programming Training',  sub: 'LNIT · Sep–Dec 2023'                 },
];

// Headline words — each wrapped in a highlighted box, revealed staggered on scroll
const HEADLINE_WORDS = [
  'Building', 'at', 'the', 'intersection', 'of', 'design', '&', 'code',
];

// Sub-line chips — same treatment at smaller scale
const SUBLINE_CHIPS = [
  "I'm", 'a', 'Computer', 'Science', 'student', 'at', 'BML', 'Munjal', 'University', 'who',
  'builds', 'digital', 'experiences.'
];

export default function AboutSection() {
  const sectionRef = useSectionReveal('.js-about', {
    variant: 'fade-rise',
    stagger: 0.10,
    start: 'top 80%',
    duration: 0.85,
    ease: 'power3.out',
  });

  // Bespoke headline word-reveal (scoped useEffect — hooks into same timing family)
  const headlineRef  = useRef(null);
  const sublineRef   = useRef(null);


  useEffect(() => {
    if (REDUCED_MOTION()) {
      // Make everything visible immediately
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.about-word-inner');
        gsap.set(words, { y: 0, opacity: 1 });
      }
      if (sublineRef.current) {
        const chips = sublineRef.current.querySelectorAll('.about-chip-inner');
        gsap.set(chips, { y: 0, opacity: 1 });
      }
      return;
    }

    const ctx = gsap.context(() => {
      // ── Headline: staggered word-by-word curtain reveal ──────────────
      const headlineWords = headlineRef.current?.querySelectorAll('.about-word-inner') ?? [];
      if (headlineWords.length) {
        gsap.set(headlineWords, { y: '108%', opacity: 0 });
        gsap.to(headlineWords, {
          y: '0%',
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.065,
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 82%',
            once: true,
          },
        });
      }

      // ── Sub-line chips: same reveal, tighter stagger, slight delay ───
      const chips = sublineRef.current?.querySelectorAll('.about-chip-inner') ?? [];
      if (chips.length) {
        gsap.set(chips, { y: '110%', opacity: 0 });
        gsap.to(chips, {
          y: '0%',
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.04,
          delay: 0.2,
          scrollTrigger: {
            trigger: sublineRef.current,
            start: 'top 82%',
            once: true,
          },
        });
      }


    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="about-section"
      aria-labelledby="about-heading"
    >
      {/* ══ BLOCK 1 — Headline ════════════════════════════════════════════ */}
      <div className="about-headline-block">
        {/* Word-by-word highlighted headline */}
        <h2
          id="about-heading"
          ref={headlineRef}
          className="about-headline"
          aria-label="Building at the intersection of design & code"
        >
          {HEADLINE_WORDS.map((word, i) => (
            <span key={i} className="about-word-curtain">
              <span
                className={`about-word-inner ${
                  word === 'design' ? 'word--warm' :
                  word === 'code'   ? 'word--cool' : ''
                }`}
              >
                {word}
              </span>
            </span>
          ))}
        </h2>

        {/* Sub-line chips + "builds" emphasis */}
        <p
          ref={sublineRef}
          className="about-subline"
          aria-label="I'm a Computer Science student at BML Munjal University who builds digital experiences."
        >
          {SUBLINE_CHIPS.map((chip, i) => (
            <span key={i} className={`about-chip-curtain ${chip === 'builds' ? 'about-chip-curtain--builds' : ''}`}>
              <span className={`about-chip-inner ${chip === 'builds' ? 'about-chip-inner--builds' : ''}`}>
                {chip}
              </span>
            </span>
          ))}
        </p>

      </div>

      {/* ══ BLOCK 2 — Body copy ══════════════════════════════════════════ */}
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



      {/* ══ BLOCK 4 — Education + Certifications (Two-Column Balanced) ═══ */}
      <div className="about-lower-grid">

        {/* ── LEFT: Photo Column ────────────────────────────────────── */}
        <div className="about-photo-col js-about">

          {/* SWAPPABLE PHOTO SLOT */}
          <div
            className="about-photo-slot"
            role="img"
            aria-label="Photo of Sujal Jaiswal"
            style={{ border: 'none', background: 'transparent' }}
          >
            {/* Liquid Distortion Image Container */}
            <div 
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '16px', 
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
              }}
            >
              <LiquidHover
                imageSrc="/profile-photo.png"
                cursorSize={280}
                intensity={30}
                resolution={10}
              />
            </div>
            
            {/* Location badge overlapping photo */}
            <div className="about-location-badge">
              <span className="about-location-badge__icon" aria-hidden="true">📍</span>
              Gurugram, India
            </div>
          </div>
        </div>

        {/* ── RIGHT: Text Column (Education & Certs) ────────────────── */}
        <div className="about-text-col">
          
          {/* Education timeline */}
          <div className="about-edu js-about" aria-label="Education">
            <p className="about-edu__kicker">EDUCATION</p>
            <ol className="about-edu__list">
              {education.map((entry, i) => (
                <li
                  key={i}
                  className="about-edu__item js-about"
                  style={{ '--edu-delay': `${i * 0.09}s` }}
                >
                  <h3 className="about-edu__institution">{entry.institution}</h3>
                  <p className="about-edu__degree">{entry.degree}</p>
                  <p className="about-edu__meta">{entry.meta}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Certifications 2×2 grid */}
          <div className="about-cert-section js-about" aria-label="Certifications">
            <p className="about-edu__kicker">CERTIFICATIONS</p>
            <div className="about-cert-grid">
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
