/**
 * Composant DDRCountdown
 * 
 * Countdown visuel 3-2-1-GO! style DDR
 */

import { useState, useEffect } from 'react';
import './DDRCountdown.css';

export function DDRCountdown({ onComplete }) {
  const [count, setCount] = useState(3);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (count === 0) {
      // Afficher GO! pendant 300ms puis terminer
      setTimeout(() => {
        setShow(false);
        if (onComplete) {
          onComplete();
        }
      }, 300);
      return;
    }

    // Décompter toutes les 500ms
    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (!show) return null;

  const getText = () => {
    if (count === 0) return 'GO!';
    return count.toString();
  };

  const getClass = () => {
    if (count === 0) return 'ddr-countdown-go';
    return 'ddr-countdown-number';
  };

  return (
    <div className="ddr-countdown-overlay">
      <div className={`ddr-countdown-text ${getClass()}`}>
        {getText()}
      </div>
    </div>
  );
}

