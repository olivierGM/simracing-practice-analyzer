/**
 * Layout pour les pages publiques (landing, login) : header minimal + contenu
 */

import { Outlet } from 'react-router-dom';
import { MinimalHeader } from './MinimalHeader';

export function LandingLayout() {
  return (
    <>
      <MinimalHeader />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}
