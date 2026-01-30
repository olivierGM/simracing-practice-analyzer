/**
 * Test E2E: Drill une pédale — drill Seuils Multiples (Story 5)
 *
 * Le drill "Seuils Multiples" doit être présent et sélectionnable.
 * Valider au moins une séquence complète = ouvrir le drill et démarrer avec ce song.
 */

const { test, expect } = require('@playwright/test');

test.describe('Drill une pédale — Seuils Multiples', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedal-wheel-drills');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('Le drill Seuils Multiples est présent et sélectionnable', async ({ page }) => {
    const drillUnePedaleButton = page.locator('button.drill-option:has-text("Drill une pédale")');
    await expect(drillUnePedaleButton).toBeVisible({ timeout: 10000 });
    await drillUnePedaleButton.click();
    await page.waitForTimeout(1200);

    await expect(page.locator('.ddr-config')).toBeVisible({ timeout: 5000 });

    const seuilsMultiples = page.locator('.drill-song-item:has-text("Seuils Multiples")');
    await expect(seuilsMultiples.first()).toBeVisible({ timeout: 5000 });
    await seuilsMultiples.first().click();
    await page.waitForTimeout(500);

    const startButton = page.locator('button.ddr-config-start-button:has-text("Commencer")');
    await expect(startButton).toBeVisible();
    await startButton.click();
    await page.waitForTimeout(1500);

    const gameplayArea = page.locator('.ddr-gameplay-area, .ddr-dual-gameplay-container').first();
    await expect(gameplayArea).toBeVisible({ timeout: 5000 });
  });
});
