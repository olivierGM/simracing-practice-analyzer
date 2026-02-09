/**
 * Composant App principal
 *
 * Routes : / (landing), /login (public) ; /classement, /circuit/..., /account, etc. (protégées).
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { HomePage } from './pages/HomePage';
import { PilotePage } from './pages/PilotePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import { LandingPage } from './pages/LandingPage';
import { AngleMeasurementPage } from './pages/AngleMeasurementPage';
import { GamepadDebugPage } from './pages/GamepadDebugPage';
import NotFound from './pages/NotFound';
import { AnalyticsTracker } from './components/layout/AnalyticsTracker';
import { LandingLayout } from './components/layout/LandingLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { FirebaseDataGate } from './components/data/FirebaseDataGate';
import { useFirebaseDataContext } from './contexts/FirebaseDataContext';
import { TrackProvider, useTrackContext } from './contexts/TrackContext';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

const PedalWheelDrillsPage = lazy(() => import('./pages/PedalWheelDrillsPage'));

/** Layout app (protégé) : Header + Outlet, données depuis le contexte Firebase */
function AppLayout() {
  const location = useLocation();
  const isDrillsPage = location.pathname === '/pedal-wheel-drills';
  const { trackFilter } = useTrackContext();
  // AppLayout est rendu comme enfant de FirebaseDataGate's Outlet, donc le contexte est disponible
  const { metadata } = useFirebaseDataContext();

  return (
    <>
      <AnalyticsTracker />
      <div className={`app${isDrillsPage ? ' app--drills' : ''}`}>
        <Header metadata={metadata} trackName={trackFilter} isDrillsPage={isDrillsPage} />
        <main className={`main-content${isDrillsPage ? ' main-content--drills' : ''}`}>
          <Outlet />
        </main>
      </div>
    </>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
        </Route>
        <Route path="/login" element={<LandingLayout />}>
          <Route index element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          {/* Route admin : nécessite connexion + rôle admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          {/* Routes protégées normales */}
          <Route element={<FirebaseDataGate />}>
            <Route element={<AppLayout />}>
              <Route path="/classement" element={<HomePage />} />
              <Route path="/circuit/:circuitId/pilote/:pilotId" element={<PilotePage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/angle-measurement" element={<AngleMeasurementPage />} />
              <Route
                path="/pedal-wheel-drills"
                element={
                  <Suspense fallback={<LoadingSpinner message="Chargement des drills..." />}>
                    <PedalWheelDrillsPage />
                  </Suspense>
                }
              />
              <Route path="/gamepad-debug" element={<GamepadDebugPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <TrackProvider>
        <AppContent />
      </TrackProvider>
    </AuthProvider>
  );
}

export default App;
