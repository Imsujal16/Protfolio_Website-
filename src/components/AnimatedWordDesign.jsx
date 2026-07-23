import { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import './AnimatedWord.css';

export default function AnimatedWordDesign({ word = 'design' }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e) => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsHovered(true);
      return;
    }

    setIsHovered(true);
    
    // Fire confetti from the element's position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 70,
      colors: ['#e83e8c', '#d63384', '#ff79c6'],
      origin: { x, y },
      disableForReducedMotion: true,
      zIndex: 100,
      ticks: 120,
      gravity: 0.9,
      scalar: 0.7
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <span
      className={`animated-word-design ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="design-bg" />
      <span className="design-text">
        {word.split('').map((char, i) => (
          <motion.span
            key={i}
            className="design-char"
            initial={{ y: 0, rotateX: 0, rotateY: 0 }}
            animate={
              isHovered
                ? {
                    y: [0, -10, 0],
                    rotateX: [0, 25, -15, 0],
                    rotateY: [0, -20, 15, 0],
                  }
                : { y: 0, rotateX: 0, rotateY: 0 }
            }
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              delay: i * 0.035, // staggered ripple
            }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
