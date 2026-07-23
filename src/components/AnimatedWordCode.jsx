import { useState, useRef, useEffect } from 'react';
import './AnimatedWord.css';

const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

export default function AnimatedWordCode({ word = 'code' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState(word);
  const intervalRef = useRef(null);
  
  const handleMouseEnter = () => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsHovered(true);
      return;
    }

    setIsHovered(true);
    let iterations = 0;
    const maxIterations = 14;
    
    clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (iterations >= maxIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(word);
      } else {
        const scrambled = word.split('').map((char, i) => {
          if (char === ' ') return ' ';
          // Randomly keep some characters correct as it progresses
          if (iterations > maxIterations * 0.6 && Math.random() > 0.4) return char;
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join('');
        setDisplayText(scrambled);
      }
      iterations++;
    }, 35);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    clearInterval(intervalRef.current);
    setDisplayText(word);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <span 
      className={`animated-word-code ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="code-bg">
        {isHovered && <span className="scanline" />}
      </span>
      <span className="code-text">
        {displayText}
        {isHovered && <span className="terminal-cursor" />}
      </span>
    </span>
  );
}
