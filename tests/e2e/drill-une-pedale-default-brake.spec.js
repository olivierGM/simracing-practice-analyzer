/**
 * Test E2E: Drill une pédale — pédale par défaut
 *
 * Story 1: À l'ouverture de l'écran "Drill une pédale", le frein est sélectionné par défaut.
 */

const { test, expect } = require('@playwright/test');

test.describe('Drill une pédale — sélection par défaut', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedal-wheel-drills');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('À l\'ouverture de "Drill une pédale", le frein est sélectionné par défaut', async ({ page }) => {
    const drillUnePedaleButton = page.locator('button.drill-option:has-text("Drill une pédale")');
    await expect(drillUnePedaleButton).toBeVisible({ timeout: 10000 });
    await drillUnePedaleButton.click();
    await page.waitForTimeout(800);

    const configPanel = page.locator('.ddr-config');
    await expect(configPanel).toBeVisible({ timeout: 5000 });

    const freinButton = page.locator('button.ddr-config-option:has-text("Frein")');
    const accelButton = page.locator('button.ddr-config-option:has-text("Accélérateur")');
    await expect(freinButton).toBeVisible();
    await expect(accelButton).toBeVisible();

    await expect(freinButton).toHaveClass(/ddr-config-option-selected/);
    await expect(accelButton).not.toHaveClass(/ddr-config-option-selected/);
  });
});
