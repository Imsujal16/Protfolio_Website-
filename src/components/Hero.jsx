import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MaskReveal from './MaskReveal';
import styles from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger);

const Particles = ({ color, count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const isCircle = Math.random() > 0.5;
        const size = Math.random() * 4 + 2;
        return (
          <div
            key={i}
            className={`${styles.particle} ${isCircle ? styles.circle : styles.square} particle-anim`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
              opacity: Math.random() * 0.4 + 0.1,
            }}
          />
        );
      })}
    </>
  );
};

export default function Hero() {
  const wrapperRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const parallaxX = useRef(null);
  const parallaxY = useRef(null);

  useEffect(() => {
    // 1. Entrance Animations via Timeline and ScrollTrigger
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1025px)", () => {
      // Desktop: Timeline on load
      const tl = gsap.timeline({ delay: 0.2 });

      // Panels fade + slide in
      tl.fromTo(leftPanelRef.current, 
        { x: -50, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      )
      .fromTo(rightPanelRef.current, 
        { x: 50, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.5"
      );

      // Headings reveal
      tl.fromTo(".heading-word", 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        "-=0.4"
      );

      // Badges pop in
      tl.fromTo(".badge-anim", 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" },
        "-=0.2"
      );
    });

    mm.add("(max-width: 1024px)", () => {
      // Mobile: ScrollTrigger for each panel
      const panels = [leftPanelRef.current, rightPanelRef.current];
      panels.forEach((panel) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        });

        tl.fromTo(panel, 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        )
        .fromTo(panel.querySelectorAll(".heading-word"), 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(panel.querySelectorAll(".badge-anim"), 
          { scale: 0, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" },
          "-=0.2"
        );
      });
    });

    // 2. Ambient Particles Float
    const particles = document.querySelectorAll('.particle-anim');
    particles.forEach((p) => {
      gsap.to(p, {
        x: () => (Math.random() - 0.5) * 20,
        y: () => (Math.random() - 0.5) * 20,
        duration: () => Math.random() * 2 + 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: () => Math.random() * 2
      });
    });

    // 3. Mouse Parallax (Desktop Only)
    mm.add("(pointer: fine) and (min-width: 1025px)", () => {
      parallaxX.current = gsap.quickTo([leftPanelRef.current, rightPanelRef.current], "x", { duration: 0.4, ease: "power3.out" });
      parallaxY.current = gsap.quickTo([leftPanelRef.current, rightPanelRef.current], "y", { duration: 0.4, ease: "power3.out" });

      const handleMouseMove = (e) => {
        const { innerWidth, innerHeight } = window;
        // Map mouse position to -1 to 1
        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2;
        // Inverse shift by 15px
        parallaxX.current(-x * 15);
        parallaxY.current(-y * 15);
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    });

    return () => mm.revert();
  }, []);

  return (
    <div className={styles.heroWrapper} ref={wrapperRef}>
      <div className={styles.maskContainer}>
        <MaskReveal />
      </div>

      <div className={styles.panelsGrid}>
        {/* Left Panel */}
        <div className={`${styles.leftPanelWrapper} ${styles.leftPanel}`} ref={leftPanelRef}>
          <div className={styles.panel}>
            <Particles color="#00f0ff" count={8} />
            <div className={styles.labelRow}>
              <div className={styles.dot} />
              <div className={styles.labelText}>Full Stack Dev</div>
            </div>
            
            <div className={styles.heading}>
              <span className={`heading-word ${styles.headingWhite}`}>&lt;</span>
              <span className={`heading-word ${styles.headingWhite}`}>coder</span>
              <span className={`heading-word ${styles.headingCyan}`}>/&gt;</span>
            </div>
            
            <div className={styles.description}>
              Building scalable, high-performance backends and seamless, interactive frontends.
            </div>

            <div className={styles.badges}>
              <div className={`badge-anim ${styles.badge}`}>Java</div>
              <div className={`badge-anim ${styles.badge}`}>C++</div>
              <div className={`badge-anim ${styles.badge}`}>SQL</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className={`${styles.rightPanelWrapper} ${styles.rightPanel}`} ref={rightPanelRef}>
          <div className={styles.panel}>
            <Particles color="#ff00ff" count={8} />
            <div className={styles.labelRow}>
              <div className={styles.dot} />
              <div className={styles.labelText}>UI/UX Designer</div>
            </div>
            
            <div className={styles.heading}>
              <span className={`heading-word ${styles.headingGradient}`}>designer</span>
              <span className={`heading-word ${styles.headingPink}`}>.</span>
            </div>
            
            <div className={styles.description}>
              Crafting pixel-perfect, human-centered interfaces that users <span className={styles.descHighlight}>feel</span>.
            </div>

            <div className={styles.badges}>
              <div className={`badge-anim ${styles.badge}`}>Figma</div>
              <div className={`badge-anim ${styles.badge}`}>Wireframing</div>
              <div className={`badge-anim ${styles.badge}`}>Prototyping</div>
              <div className={`badge-anim ${styles.badge}`}>Design Systems</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
