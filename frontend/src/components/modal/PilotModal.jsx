/**
 * Composant PilotModal
 * 
 * Modal principale affichant toutes les infos d'un pilote :
 * - Stats principales (meilleur temps, potentiel, constance)
 * - Comparateur de segments
 * - Graphique de progression
 * - Liste des tours
 */

import { useEffect } from 'react';
import { PilotStats } from './PilotStats';
import { SegmentComparator } from './SegmentComparator';
import { ProgressionChart } from './ProgressionChart';
import { LapsTable } from './LapsTable';
import './PilotModal.css';

export function PilotModal({ driver, allDrivers, onClose }) {
  // Fermer la modal avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!driver) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header avec nom et bouton fermer */}
        <div className="modal-header">
          <h2 className="pilot-name">{driver.name}</h2>
          <button
            className="close-modal"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Contenu de la modal */}
        <div className="modal-body">
          {/* Stats principales */}
          <PilotStats driver={driver} />

          {/* Comparateur de segments */}
          <SegmentComparator driver={driver} allDrivers={allDrivers} />

          {/* Graphique de progression */}
          <ProgressionChart driver={driver} />

          {/* Liste des tours */}
          <LapsTable driver={driver} />
        </div>
      </div>
    </div>
  );
}

