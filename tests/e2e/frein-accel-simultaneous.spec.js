/**
 * Test E2E: Frein + Accélérateur — random simultané (Story 3)
 *
 * Les modes random peuvent demander frein ET accélérateur en même temps.
 * On vérifie que le drill Frein+Accél démarre et affiche les deux lanes.
 */

const { test, expect } = require('@playwright/test');

test.describe('Frein + Accélérateur — random simultané', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedal-wheel-drills');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('Démarrer le drill Frein+Accél en mode Random et vérifier les deux lanes', async ({ page }) => {
    const brakeAccelButton = page.locator('button.drill-option:has-text("Frein + Accélérateur")');
    await expect(brakeAccelButton).toBeVisible({ timeout: 10000 });
    await brakeAccelButton.click();
    await page.waitForTimeout(1000);

    const startButton = page.locator('button.ddr-config-start-button');
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    await page.waitForTimeout(2500);

    const laneAccel = page.locator('.ddr-lane-accel, .ddr-lane.ddr-lane-accel').first();
    const laneBrake = page.locator('.ddr-lane-brake, .ddr-lane.ddr-lane-brake').first();
    await expect(laneAccel).toBeVisible({ timeout: 5000 });
    await expect(laneBrake).toBeVisible({ timeout: 5000 });
  });
});
