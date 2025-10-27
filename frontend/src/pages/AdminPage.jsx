/**
 * Page AdminPage
 * 
 * Panel d'administration pour upload de fichiers JSON
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, uploadSessionFile, uploadEGTFile } from '../services/firebase';
import './AdminPage.css';

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [sessionFile, setSessionFile] = useState(null);
  const [egtFile, setEgtFile] = useState(null);
  const navigate = useNavigate();

  const ADMIN_PASSWORD = 'admin123'; // TODO: Remplacer par variable d'environnement

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setUploadStatus('');
    } else {
      setUploadStatus('❌ Mot de passe incorrect');
    }
    setPassword('');
  };

  const handleSessionUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('⏳ Upload en cours...');

    try {
      await uploadSessionFile(file);
      setUploadStatus('✅ Fichier session uploadé avec succès!');
      setSessionFile(null);
      // Recharger après 2 secondes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Erreur upload:', error);
      setUploadStatus('❌ Erreur lors de l\'upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEGTUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('⏳ Upload en cours...');

    try {
      await uploadEGTFile(file);
      setUploadStatus('✅ Fichier EGT uploadé avec succès!');
      setEgtFile(null);
      // Recharger après 2 secondes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Erreur upload:', error);
      setUploadStatus('❌ Erreur lors de l\'upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword('');
    setUploadStatus('');
    navigate('/');
  };

  if (!authenticated) {
    return (
      <div className="container">
        <div className="admin-auth-section">
          <div className="admin-auth-form">
            <h2>🔐 Connexion Admin</h2>
            <p>Accès réservé aux administrateurs pour l'upload de fichiers JSON</p>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe admin"
                className="admin-password-input"
              />
              <button type="submit" className="admin-login-btn">
                Se connecter
              </button>
            </form>
            {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
            <button onClick={() => navigate('/')} className="back-to-app-btn">
              ← Retour à l'application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>⚙️ Panel d'Administration</h2>
          <button onClick={handleLogout} className="admin-logout-btn">
            Déconnexion
          </button>
        </div>

        <div className="admin-content">
          <div className="upload-section">
            <h3>📤 Upload de Fichiers</h3>
            
            <div className="upload-card">
              <h4>Session JSON</h4>
              <p>Uploader les données de session (FP, Q, R)</p>
              <input
                type="file"
                accept=".json"
                onChange={handleSessionUpload}
                disabled={uploading}
                className="file-input"
              />
            </div>

            <div className="upload-card">
              <h4>EGT JSON</h4>
              <p>Uploader les données EGT (scraping automatique)</p>
              <input
                type="file"
                accept=".json"
                onChange={handleEGTUpload}
                disabled={uploading}
                className="file-input"
              />
            </div>

            {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
          </div>

          <div className="info-section">
            <h3>ℹ️ Informations</h3>
            <ul>
              <li><strong>Upload Session:</strong> Ajoute une nouvelle session de course (FP/Q/R)</li>
              <li><strong>Upload EGT:</strong> Met à jour les données EGT globales</li>
              <li>Les données sont immédiatement disponibles après upload</li>
              <li>L'application se recharge automatiquement après un upload réussi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

