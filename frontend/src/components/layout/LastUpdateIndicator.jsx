/**
 * Composant LastUpdateIndicator
 * 
 * Affiche "Dernière session : Il y a Xh"
 * Calcule le temps écoulé depuis la dernière session
 * 
 * ⚠️ LOGIQUE CRITIQUE - Timezone
 */

import { useMemo } from 'react';
import { parseSessionDate, formatUpdateDate, createSessionTooltip } from '../../services/timezone';
import './LastUpdateIndicator.css';

export function LastUpdateIndicator({ metadata }) {
  // Calculer les infos de dernière session
  const sessionInfo = useMemo(() => {
    if (!metadata || !metadata.lastUpdate) {
      return {
        text: '-',
        tooltip: 'Aucune donnée disponible'
      };
    }

    // Parser la date avec l'offset timezone
    const sessionDate = parseSessionDate(metadata.lastUpdate);
    
    // Formater le texte "Il y a Xh"
    const text = formatUpdateDate(sessionDate);
    
    // Créer le tooltip détaillé
    const sessionCount = metadata.sessionCount || 0;
    const tooltip = createSessionTooltip(sessionDate, sessionCount);

    return { text, tooltip };
  }, [metadata]);

  return (
    <div id="lastUpdateIndicator" className="last-update-indicator">
      <span className="update-label">Dernière session :</span>
      <span
        id="updateDate"
        className="update-date"
        title={sessionInfo.tooltip}
      >
        {sessionInfo.text}
      </span>
    </div>
  );
}

