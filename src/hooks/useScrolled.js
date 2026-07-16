/**
 * useScrolled.js
 *
 * Returns `true` once the page has scrolled past `threshold` pixels.
 * Uses a passive scroll listener and schedules no React renders in RAF.
 * One listener, one boolean state change per threshold crossing.
 */
import { useState, useEffect } from 'react';

export function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount in case page loads already scrolled
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}
