/**
 * Page Mon compte : profil, pilote lié, préférences (thème et mapping synchronisés)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseDataContext } from '../contexts/FirebaseDataContext';
import { getUserProfile, updateUserProfile } from '../services/firebase';
import { useTheme } from '../hooks/useTheme';
import { loadMappingConfig, saveMappingConfig } from '../services/deviceMappingService';
import './AccountPage.css';

export function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { drivers = [] } = useFirebaseDataContext();
  const { currentTheme, setTheme, themes } = useTheme();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkedPilotId, setLinkedPilotId] = useState('');
  const [themePref, setThemePref] = useState(currentTheme);
  const [mappingSaveStatus, setMappingSaveStatus] = useState('');
  const [mappingRestoreStatus, setMappingRestoreStatus] = useState('');

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login?from=/account');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      setProfileLoading(true);
      const p = await getUserProfile(user.uid);
      if (!cancelled && p) {
        setProfile(p);
        setLinkedPilotId(p.linkedPilotId || '');
        setThemePref(p.theme || currentTheme);
      }
      setProfileLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when user.uid is set
  }, [user?.uid]);

  useEffect(() => {
    if (profile?.theme && profile.theme !== themePref) setThemePref(profile.theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync profile.theme into themePref when profile loads
  }, [profile?.theme]);

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        linkedPilotId: linkedPilotId || null,
        theme: themePref
      });
      setTheme(themePref);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMappingToCloud = async () => {
    if (!user?.uid) return;
    setMappingSaveStatus('Enregistrement…');
    try {
      const config = loadMappingConfig();
      await updateUserProfile(user.uid, { deviceMapping: config });
      setMappingSaveStatus('Sauvegardé.');
      setTimeout(() => setMappingSaveStatus(''), 3000);
    } catch (err) {
      console.error('Save mapping error:', err);
      setMappingSaveStatus('Erreur.');
    }
  };

  const handleRestoreMappingFromCloud = async () => {
    if (!user?.uid) return;
    setMappingRestoreStatus('Chargement…');
    try {
      const profile = await getUserProfile(user.uid);
      if (profile?.deviceMapping) {
        saveMappingConfig(profile.deviceMapping);
        setMappingRestoreStatus('Config restaurée. Rechargez la page Drills si besoin.');
      } else {
        setMappingRestoreStatus('Aucune config sauvegardée.');
      }
      setTimeout(() => setMappingRestoreStatus(''), 5000);
    } catch (err) {
      console.error('Restore mapping error:', err);
      setMappingRestoreStatus('Erreur.');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="account-page">
        <div className="account-card"><p>Chargement...</p></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="account-page">
      <div className="account-card">
        <h1>Mon compte</h1>
        <p className="account-email">{user.email}</p>

        {profileLoading ? (
          <p>Chargement du profil...</p>
        ) : (
          <>
            <section className="account-section">
              <h2>Pilote lié</h2>
              <p className="account-hint">Associez votre compte à votre fiche pilote pour un accès rapide à vos stats.</p>
              <select
                value={linkedPilotId}
                onChange={(e) => setLinkedPilotId(e.target.value)}
                className="account-select"
              >
                <option value="">— Aucun —</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.track ? `(${d.track})` : ''}
                  </option>
                ))}
              </select>
            </section>

            <section className="account-section">
              <h2>Thème</h2>
              <p className="account-hint">Synchronisé sur tous vos appareils lorsque vous êtes connecté.</p>
              <select
                value={themePref}
                onChange={(e) => setThemePref(e.target.value)}
                className="account-select"
              >
                {themes.map((t) => (
                  <option key={t} value={t}>
                    {t === 'auto' ? 'Auto' : t === 'dark' ? 'Sombre' : 'Clair'}
                  </option>
                ))}
              </select>
            </section>

            <section className="account-section">
              <h2>Mapping volant / pédales</h2>
              <p className="account-hint">
                Configuré depuis la page{' '}
                <button type="button" className="account-link" onClick={() => navigate('/pedal-wheel-drills')}>
                  Drills Pédales & Volant
                </button>
                . Sauvegardez ou restaurez votre config depuis le cloud pour la retrouver sur un autre appareil.
              </p>
              <div className="account-mapping-actions">
                <button type="button" className="account-btn-secondary" onClick={handleSaveMappingToCloud}>
                  Sauvegarder dans le cloud
                </button>
                <button type="button" className="account-btn-secondary" onClick={handleRestoreMappingFromCloud}>
                  Restaurer depuis le cloud
                </button>
              </div>
              {mappingSaveStatus && <p className="account-status">{mappingSaveStatus}</p>}
              {mappingRestoreStatus && <p className="account-status">{mappingRestoreStatus}</p>}
            </section>

            <button type="button" className="account-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        )}

        <button type="button" className="account-back" onClick={() => navigate('/classement')}>
          Retour au classement
        </button>
      </div>
    </div>
  );
}
