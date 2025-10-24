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
import { useProcessedData } from '../hooks/useProcessedData';
import './PilotePage.css';

export function PilotePage({ drivers, sessions = [] }) {
  const { circuitId, pilotId } = useParams();
  const navigate = useNavigate();

  // Décoder le nom du circuit depuis l'URL pour déterminer la piste
  const trackName = useMemo(() => {
    // Essayer de trouver le pilote dans les drivers globaux pour avoir son track
    const globalPilot = drivers.find(d => d.id === pilotId);
    return globalPilot?.track || '';
  }, [drivers, pilotId]);

  // Reprocesser les données pour la piste spécifique du pilote
  const driversForTrack = useProcessedData(sessions, trackName);

  // Trouver le pilote dans les données retraitées (données correctes pour cette piste)
  const pilot = useMemo(() => {
    return driversForTrack.find(d => d.id === pilotId);
  }, [driversForTrack, pilotId]);

  // Décoder le nom du circuit depuis l'URL
  const circuitName = useMemo(() => {
    if (!circuitId) return '';
    
    // Convertir le slug en nom lisible
    return circuitId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [circuitId]);

  // Si pilote non trouvé
  if (!pilot) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Pilote non trouvé</h2>
          <p>Le pilote avec l'ID "{pilotId}" n'existe pas sur le circuit "{circuitName}".</p>
          <button onClick={() => navigate('/')} className="back-button">
            ← Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  // Vérifier que le pilote correspond bien au circuit
  const pilotCircuitSlug = pilot.track
    ? pilot.track
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    : 'circuit';

  if (pilotCircuitSlug !== circuitId) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Circuit incorrect</h2>
          <p>Le pilote {pilot.name} n'a pas de données pour le circuit "{circuitName}".</p>
          <p>Ce pilote a roulé sur : {pilot.track}</p>
          <button onClick={() => navigate('/')} className="back-button">
            ← Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <button onClick={() => navigate('/')} className="breadcrumb-link">
          Accueil
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{pilot.track}</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{pilot.name}</span>
      </nav>

      {/* Header de la fiche pilote */}
      <div className="pilot-page-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Retour
        </button>
        <div className="pilot-title-group">
          <h1 className="pilot-page-title">{pilot.name}</h1>
          <p className="pilot-circuit">{pilot.track}</p>
        </div>
      </div>

      {/* Contenu de la fiche */}
      <div className="pilot-page-content">
        {/* Stats principales */}
        <PilotStats driver={pilot} />

        {/* Comparateur de segments */}
        <SegmentComparator driver={pilot} allDrivers={driversForTrack} />

        {/* Graphique de progression */}
        <ProgressionChart driver={pilot} />

        {/* Liste des tours */}
        <LapsTable driver={pilot} />
      </div>
    </div>
  );
}

