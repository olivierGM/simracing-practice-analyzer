/**
 * Composant DeviceConnector
 * 
 * Gère la connexion et la sélection des périphériques gamepad
 */

import { useGamepad } from '../../hooks/useGamepad';
import './DeviceConnector.css';

export function DeviceConnector({ onGamepadSelect }) {
  const {
    isSupported,
    isConnected,
    gamepads,
    gamepadInfo,
    selectGamepad
  } = useGamepad();

  const handleGamepadSelect = (index) => {
    selectGamepad(index);
    if (onGamepadSelect) {
      onGamepadSelect(index);
    }
  };

  if (!isSupported) {
    return (
      <div className="device-connector">
        <div className="device-status device-status-error">
          <span className="status-icon">⚠️</span>
          <div className="status-content">
            <h3>Gamepad API non supporté</h3>
            <p>Votre navigateur ne supporte pas l'API Gamepad. Veuillez utiliser un navigateur moderne (Chrome, Firefox, Edge).</p>
          </div>
        </div>
      </div>
    );
  }

  if (gamepads.length === 0) {
    return (
      <div className="device-connector">
        <div className="device-status device-status-warning">
          <span className="status-icon">🔌</span>
          <div className="status-content">
            <h3>Aucun périphérique détecté</h3>
            <p>Connectez votre volant et vos pédales, puis appuyez sur n'importe quel bouton ou pédale pour les activer.</p>
            <details className="troubleshooting-guide">
              <summary className="troubleshooting-summary">🔧 Guide de dépannage (Moza R9, SimJack, etc.)</summary>
              <div className="troubleshooting-content">
                <h4>Pour Moza R9 et autres volants Direct Drive :</h4>
                <ol>
                  <li><strong>Vérifier que le volant est reconnu par Windows :</strong>
                    <ul>
                      <li>Ouvrir "Paramètres" → "Périphériques" → "Contrôleurs de jeu USB"</li>
                      <li>Le Moza R9 devrait apparaître dans la liste</li>
                      <li>Si absent, installer/redémarrer MOZA Pit House</li>
                    </ul>
                  </li>
                  <li><strong>Activer le gamepad :</strong>
                    <ul>
                      <li>Appuyer sur un bouton du volant ou bouger une pédale</li>
                      <li>Le navigateur ne détecte que les gamepads "activés"</li>
                    </ul>
                  </li>
                  <li><strong>Vérifier le navigateur :</strong>
                    <ul>
                      <li>Chrome/Edge : Meilleur support</li>
                      <li>Firefox : Support correct</li>
                      <li>Assurez-vous d'utiliser une version récente</li>
                    </ul>
                  </li>
                  <li><strong>Si le volant n'est toujours pas détecté :</strong>
                    <ul>
                      <li>Le Moza R9 peut ne pas être reconnu comme "gamepad standard"</li>
                      <li>Dans ce cas, nous devrons utiliser l'API WebHID (à venir)</li>
                      <li>Vérifier que MOZA Pit House est installé et à jour</li>
                    </ul>
                  </li>
                </ol>
                <p className="troubleshooting-note">
                  <strong>Note :</strong> Certains volants Direct Drive (comme le Moza R9) peuvent nécessiter 
                  une configuration spéciale ou l'utilisation de l'API WebHID pour être détectés dans le navigateur.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="device-connector">
      <div className="device-status device-status-success">
        <span className="status-icon">✅</span>
        <div className="status-content">
          <h3>Périphériques détectés</h3>
          <p className="device-count">{gamepads.length} périphérique{gamepads.length > 1 ? 's' : ''} connecté{gamepads.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="device-list">
        {gamepads.map((gamepad, index) => {
          const info = gamepad ? {
            id: gamepad.id || 'Gamepad inconnu',
            index: gamepad.index,
            axes: gamepad.axes?.length || 0,
            buttons: gamepad.buttons?.length || 0
          } : null;

          return (
            <div
              key={index}
              className={`device-item ${isConnected && gamepadInfo?.index === index ? 'device-item-active' : ''}`}
              onClick={() => handleGamepadSelect(index)}
            >
              <div className="device-item-header">
                <span className="device-item-icon">🎮</span>
                <div className="device-item-info">
                  <h4>{info?.id || `Gamepad ${index + 1}`}</h4>
                  <p className="device-item-details">
                    {info?.axes || 0} axes • {info?.buttons || 0} boutons
                  </p>
                </div>
                {isConnected && gamepadInfo?.index === index && (
                  <span className="device-item-badge">Actif</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {gamepadInfo && (
        <div className="device-info">
          <h4>Informations du périphérique actif</h4>
          <div className="device-info-grid">
            <div className="device-info-item">
              <span className="device-info-label">ID :</span>
              <span className="device-info-value">{gamepadInfo.id}</span>
            </div>
            <div className="device-info-item">
              <span className="device-info-label">Index :</span>
              <span className="device-info-value">{gamepadInfo.index}</span>
            </div>
            <div className="device-info-item">
              <span className="device-info-label">Mapping :</span>
              <span className="device-info-value">{gamepadInfo.mapping}</span>
            </div>
            <div className="device-info-item">
              <span className="device-info-label">Axes :</span>
              <span className="device-info-value">{gamepadInfo.axes}</span>
            </div>
            <div className="device-info-item">
              <span className="device-info-label">Boutons :</span>
              <span className="device-info-value">{gamepadInfo.buttons}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

