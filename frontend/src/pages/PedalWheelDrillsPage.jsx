/**
 * Page PedalWheelDrillsPage
 * 
 * Page dédiée pour l'outil de drills pédales/volant
 */

import { PedalWheelDrills } from '../components/pedal-wheel-drills/PedalWheelDrills';
import './PedalWheelDrillsPage.css';

export default function PedalWheelDrillsPage() {
  return (
    <div className="pedal-wheel-drills-page">
      <div className="page-header page-header-compact">
        <h3 className="page-title-compact">🎮 Drills Pédales & Volant</h3>
      </div>
      
      <PedalWheelDrills />
    </div>
  );
}

