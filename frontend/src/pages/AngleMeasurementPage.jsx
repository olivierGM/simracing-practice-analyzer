/**
 * Page AngleMeasurementPage
 * 
 * Outil de mesure d'angles sur rig de sim racing
 * Permet d'uploader une image et de mesurer des angles
 */

import { AngleMeasurement } from '../components/angle-measurement/AngleMeasurement';
import './AngleMeasurementPage.css';

export function AngleMeasurementPage() {
  return (
    <div className="angle-measurement-page">
      <div className="angle-measurement-header">
        <h1>Outil de mesure d'angles</h1>
        <p>Importez une photo de votre setup pour mesurer les angles de vos bras, jambes ou du siège</p>
      </div>
      
      <AngleMeasurement />
    </div>
  );
}

