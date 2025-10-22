/**
 * Composant LoadingSpinner
 * 
 * Spinner de chargement simple
 */

import './LoadingSpinner.css';

export function LoadingSpinner({ size = 'medium', message = 'Chargement...' }) {
  return (
    <div className="loading-container">
      <div className={`loading-spinner ${size}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

