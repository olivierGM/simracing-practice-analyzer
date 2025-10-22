/**
 * Page PilotePage
 * 
 * Fiche détaillée d'un pilote (route séparée)
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { PilotStats } from '../components/pilot/PilotStats';
import { SegmentComparator } from '../components/pilot/SegmentComparator';
import { ProgressionChart } from '../components/pilot/ProgressionChart';
import { LapsTable } from '../components/pilot/LapsTable';
import './PilotePage.css';

export function PilotePage({ drivers }) {
  const { pilotId } = useParams();
  const navigate = useNavigate();

  // Trouver le pilote
  const pilot = useMemo(() => {
    return drivers.find(d => d.id === pilotId);
  }, [drivers, pilotId]);

  // Si pilote non trouvé
  if (!pilot) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Pilote non trouvé</h2>
          <p>Le pilote avec l'ID "{pilotId}" n'existe pas.</p>
          <button onClick={() => navigate('/')} className="back-button">
            ← Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header de la fiche pilote */}
      <div className="pilot-page-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Retour
        </button>
        <h1 className="pilot-page-title">{pilot.name}</h1>
      </div>

      {/* Contenu de la fiche */}
      <div className="pilot-page-content">
        {/* Stats principales */}
        <PilotStats driver={pilot} />

        {/* Comparateur de segments */}
        <SegmentComparator driver={pilot} allDrivers={drivers} />

        {/* Graphique de progression */}
        <ProgressionChart driver={pilot} />

        {/* Liste des tours */}
        <LapsTable driver={pilot} />
      </div>
    </div>
  );
}

