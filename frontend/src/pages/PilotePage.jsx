/**
 * Page PilotePage
 * 
 * Fiche détaillée d'un pilote (route séparée)
 */

import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { PilotStats } from '../components/pilot/PilotStats';
import { SegmentComparator } from '../components/pilot/SegmentComparator';
import { ProgressionChart } from '../components/pilot/ProgressionChart';
import { LapsTable } from '../components/pilot/LapsTable';
import { useProcessedData } from '../hooks/useProcessedData';
import { getCategoryName, getCategoryClass } from '../services/calculations';
import { addSeasonToSessions, filterSessionsBySeason } from '../services/seasonService';
import './PilotePage.css';

export function PilotePage({ drivers, sessions = [] }) {
  const { circuitId, pilotId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Récupérer le paramètre season de l'URL
  const seasonFromUrl = searchParams.get('season');

  // Décoder le nom du circuit depuis l'URL pour déterminer la piste
  // CRITIQUE: Utiliser circuitId de l'URL, pas le track global du pilote
  // car un pilote peut avoir roulé sur plusieurs pistes
  const trackName = useMemo(() => {
    // Convertir circuitId en nom de track
    // ex: "misano" -> "misano", "red-bull-ring" -> "red bull ring"
    if (!circuitId) return '';
    
    const track = circuitId
      .split('-')
      .map(word => word.charAt(0).toLowerCase() + word.slice(1))
      .join(' ');
    
    return track;
  }, [circuitId]);

  // Filtrer les sessions par saison si un paramètre season est présent dans l'URL
  const filteredSessions = useMemo(() => {
    if (!seasonFromUrl || seasonFromUrl === 'all') {
      return sessions;
    }
    
    // Ajouter le champ season aux sessions et filtrer
    const sessionsWithSeasons = addSeasonToSessions(sessions);
    return filterSessionsBySeason(sessionsWithSeasons, parseInt(seasonFromUrl));
  }, [sessions, seasonFromUrl]);

  // Reprocesser les données pour la piste spécifique du pilote (avec sessions filtrées par saison)
  const driversForTrack = useProcessedData(filteredSessions, trackName);

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

  // Calculer le classement de la catégorie
  const categoryStats = useMemo(() => {
    if (!pilot || !driversForTrack) return { categoryPosition: 0, categoryDrivers: 0 };
    
    const categoryDrivers = driversForTrack.filter(d => d.category === pilot.category);
    const sortedCategoryDrivers = [...categoryDrivers].sort((a, b) => {
      const timeA = a.bestValidTime || 0;
      const timeB = b.bestValidTime || 0;
      if (timeA === 0 && timeB === 0) return 0;
      if (timeA === 0) return 1;
      if (timeB === 0) return -1;
      return timeA - timeB;
    });
    
    const categoryPosition = sortedCategoryDrivers.findIndex(d => d.id === pilotId) + 1;
    
    return { categoryPosition, categoryDrivers: categoryDrivers.length };
  }, [pilot, driversForTrack, pilotId]);

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
      {/* Header de la fiche pilote */}
      <div className="pilot-page-header">
        <div className="pilot-title-group">
          <h1 className="pilot-page-title">{pilot.name}</h1>
          <div className="pilot-details">
            <span className={`pilot-category-badge ${getCategoryClass(pilot.category)}`}>{getCategoryName(pilot.category)}</span>
            <span className="pilot-position">#{categoryStats.categoryPosition}/{categoryStats.categoryDrivers}</span>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="back-button">
          ← Retour
        </button>
      </div>

      {/* Contenu de la fiche */}
      <div className="pilot-page-content">
        {/* Stats principales */}
        <PilotStats driver={pilot} allDrivers={driversForTrack} />

        {/* Comparateur de segments */}
        <SegmentComparator driver={pilot} allDrivers={driversForTrack} />

        {/* Container laps et graphique côte à côte */}
        <div className="laps-chart-container">
          {/* Graphique de progression */}
          <ProgressionChart driver={pilot} />

          {/* Liste des tours */}
          <LapsTable driver={pilot} />
        </div>
      </div>
    </div>
  );
}

