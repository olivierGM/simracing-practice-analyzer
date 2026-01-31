/**
 * Test E2E: Drill complet Motek (Story 1)
 *
 * - Le drill "Drill complet Motek" apparaît dans la liste
 * - Il démarre et affiche le flow "Drill complet"
 * - État "en cours" visible
 */

import { test, expect } from '@playwright/test';

test.describe('Drill complet Motek', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedal-wheel-drills');
    await page.waitForLoadState('networkidle');
    // Attendre que les cartes ou le chargement soient visibles
    await page.waitForSelector('.drills-type-cards, .drills-home-loading', { timeout: 15000 });
    await page.waitForTimeout(2000); // Laisser le temps au chargement Firebase
  });

  test('le drill Motek apparaît dans les cartes', async ({ page }) => {
    // Fallback: chercher par texte si data-testid n'est pas encore rendu
    const motekCard = page.getByRole('button', { name: /Drill Complet Motek/i }).or(
      page.getByTestId('drill-card-motek')
    );
    await expect(motekCard.first()).toBeVisible({ timeout: 15000 });
    await expect(motekCard.first()).toContainText('Drill Complet Motek');
  });

  test('ouvrir le drill Motek, démarrer, voir état en cours', async ({ page }) => {
    // Cliquer sur la carte Drill complet Motek
    const motekCard = page.getByRole('button', { name: /Drill Complet Motek/i }).or(
      page.getByTestId('drill-card-motek')
    ).first();
    await expect(motekCard).toBeVisible({ timeout: 15000 });
    await motekCard.click();
    await page.waitForTimeout(300);

    // Vérifier que le mode démo (mock) est affiché et sélectionné
    const demoItem = page.getByTestId('drill-motek-demo');
    await expect(demoItem).toBeVisible();
    await expect(demoItem).toContainText('Mode démo (mock)');

    // Cliquer sur Lancer le drill
    await page.getByTestId('drill-start-button').click();
    await page.waitForTimeout(800);

    // Vérifier que le drill est en cours (écran de gameplay visible)
    const gameplayArea = page.getByTestId('drill-complet-active');
    await expect(gameplayArea).toBeVisible({ timeout: 5000 });
    await expect(gameplayArea).toContainText('Drill Complet');
  });
});
