/**
 * NarrativeSections.jsx
 *
 * Contains: Projects, Skills, Experience, Contact sections.
 * The About section has been extracted to AboutSection.jsx.
 *
 * Each section uses the shared useSectionReveal() hook via .js-reveal
 * class selectors — so swapping reveal variant is a one-line change.
 * Study-image parallax is preserved as a separate scrubbed ScrollTrigger
 * since it's a continuous effect, not a one-shot reveal.
 */
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSectionReveal } from '../hooks/useSectionReveal';
import studyImage from '../assets/3.png';
import maskedPortrait from '../assets/back1.png';
import portraitImage from '../assets/front.png';
import './NarrativeSections.css';

gsap.registerPlugin(ScrollTrigger);

const skillGroups = [
  {
    title: 'Interface direction',
    items: ['Figma', 'Wireframing', 'Prototyping', 'UI/UX design'],
    tone: 'warm',
  },
  {
    title: 'Frontend craft',
    items: ['React', 'JavaScript', 'HTML', 'CSS', 'API integration'],
    tone: 'cool',
  },
  {
    title: 'Systems thinking',
    items: ['Java', 'C++', 'SQL', 'Node.js', 'MySQL', 'DSA'],
    tone: 'neutral',
  },
];

const studies = [
  {
    title: 'Nirmaan Public School',
    type: 'Full-stack web engineer',
    description: 'Built a client-side NLP search experience, resilient email delivery, technical SEO, and a faster WebGL delivery strategy.',
    image: studyImage,
    className: 'study--wide',
  },
  {
    title: 'Coding Arena',
    type: 'Android application',
    description: 'A competitive coding-practice app with authentication, profiles, an A2Z problem sheet, leaderboards, battles, and an in-app compiler.',
    image: maskedPortrait,
    className: 'study--tall',
  },
  {
    title: 'Gig Connect',
    type: 'Location-based platform',
    description: 'A web platform that connects workers and employers through location, skills, and availability.',
    image: portraitImage,
    className: 'study--square',
  },
];

function SectionIntro({ children, className = '' }) {
  return <div className={`section-intro ${className}`}>{children}</div>;
}

export default function NarrativeSections() {
  // Shared reveal: fade-rise on all .js-reveal elements across all child sections
  const rootRef = useSectionReveal('.js-reveal', {
    variant: 'fade-rise',
    stagger: 0.11,
    start: 'top 84%',
    duration: 0.9,
    ease: 'power3.out',
  });

  // Study image parallax — separate scrubbed effect (continuous, not one-shot)
  // useSectionReveal handles all .js-reveal fade-rise; this is the parallax-only effect.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.js-study', rootRef.current).forEach((element) => {
        const image = element.querySelector('img');
        if (!image) return;

        gsap.fromTo(
          image,
          { yPercent: -5, scale: 1.07 },
          {
            yPercent: 5,
            scale: 1.07,
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.7,
            },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={rootRef} className="journey">

      <section id="projects" className="projects-scene section-shell" aria-labelledby="projects-heading">
        <SectionIntro className="projects-heading js-reveal">
          <p className="section-kicker">Selected studies</p>
          <h2 id="projects-heading">A point of view, made visible.</h2>
        </SectionIntro>
        <div className="study-grid">
          {studies.map((study) => (
            <article key={study.title} className={`study ${study.className} js-study`}>
              <div className="study-media">
                <img src={study.image} alt={study.title} loading="lazy" />
              </div>
              <div className="study-copy">
                <p>{study.type}</p>
                <h3>{study.title}</h3>
                <span>{study.description}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="project-footnotes js-reveal" aria-label="Additional projects">
          <article>
            <h3>Parkymint</h3>
            <p>Smart parking system with RFID access, OTP booking, and live occupancy tracking.</p>
          </article>
          <article>
            <h3>Used Car Price Prediction</h3>
            <p>Python analysis model using preprocessing, ANOVA testing, and K-Means clustering for market segmentation.</p>
          </article>
        </div>
      </section>

      <section id="skills" className="skills-scene section-shell" aria-labelledby="skills-heading">
        <SectionIntro className="skills-heading js-reveal">
          <h2 id="skills-heading">Tools should disappear into the work.</h2>
          <p>The stack matters because it turns an idea into an experience people can actually use.</p>
        </SectionIntro>
        <div className="skill-groups">
          {skillGroups.map((group) => (
            <article key={group.title} className={`skill-group skill-group--${group.tone} js-reveal`}>
              <h3>{group.title}</h3>
              <div className="skill-list">
                {group.items.map((item) => <span key={item}>{item}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="experience-scene section-shell" aria-labelledby="experience-heading">
        <div className="experience-orbit" aria-hidden="true">
          <span>Observe</span><span>Shape</span><span>Build</span>
        </div>
        <SectionIntro className="experience-copy js-reveal">
          <p className="section-kicker">Experience</p>
          <h2 id="experience-heading">Building ideas into dependable products.</h2>
          <p>
            As a Tech Intern at Venturex, I build responsive React interfaces for ticket creation, tracking, status updates, and support workflows.
            For Nirmaan Public School, I delivered an end-to-end web experience across search, performance, email delivery, and technical SEO.
          </p>
        </SectionIntro>
      </section>

      <section id="contact" className="contact-scene section-shell" aria-labelledby="contact-heading">
        <div className="contact-ring" aria-hidden="true" />
        <SectionIntro className="contact-copy js-reveal">
          <p className="section-kicker">Get in touch</p>
          <h2 id="contact-heading">Have a project worth looking closer at?</h2>
          <p>
            Bring the problem, the rough idea, or the unfinished version. We can give it the attention it deserves.
          </p>
          <a className="contact-link" href="mailto:jaiswalsujal51@gmail.com">Start a conversation <span aria-hidden="true">↗</span></a>
        </SectionIntro>
      </section>
    </main>
  );
}
