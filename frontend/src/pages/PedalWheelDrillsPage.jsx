/**
 * Page PedalWheelDrillsPage
 * 
 * Page dédiée pour l'outil de drills pédales/volant
 */

import { PedalWheelDrills } from '../components/pedal-wheel-drills/PedalWheelDrills';
import './PedalWheelDrillsPage.css';

export function PedalWheelDrillsPage() {
  return (
    <div className="pedal-wheel-drills-page">
      <div className="page-header">
        <h1>🎮 Drills Pédales & Volant</h1>
        <p className="page-description">
          Outil interactif pour pratiquer la précision des pédales (accélérateur, frein) et du volant.
          Connectez votre volant et vos pédales pour commencer.
        </p>
      </div>
      
      <PedalWheelDrills />
    </div>
  );
}

