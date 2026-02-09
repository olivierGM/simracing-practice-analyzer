/**
 * Composant ToolsMenu
 * 
 * Menu déroulant pour les outils disponibles
 */

import { useState, useRef, useEffect } from 'react';
import './ToolsMenu.css';

export function ToolsMenu({ navigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
  };

  const handleAngleMeasurementClick = () => {
    navigate('/angle-measurement');
    setIsOpen(false);
  };

  const handlePedalWheelDrillsClick = () => {
    navigate('/pedal-wheel-drills');
    setIsOpen(false);
  };

  const handleCalendrierClick = () => {
    navigate('/calendrier');
    setIsOpen(false);
  };

  return (
    <div className="tools-menu-container" ref={menuRef}>
      <button
        className="tools-menu-button"
        onClick={handleMenuClick}
        aria-label="Outils"
        aria-expanded={isOpen}
      >
        🔧 Outils
      </button>
      
      {isOpen && (
        <div className="tools-menu-dropdown">
          <button
            className="tools-menu-item"
            onClick={handleAngleMeasurementClick}
          >
            📐 Mesure d'angles de Rig
          </button>
          <button
            className="tools-menu-item"
            onClick={handlePedalWheelDrillsClick}
          >
            🎮 Drills Pédales & Volant
          </button>
          <button
            className="tools-menu-item"
            onClick={handleCalendrierClick}
          >
            📅 Calendrier
          </button>
        </div>
      )}
    </div>
  );
}

