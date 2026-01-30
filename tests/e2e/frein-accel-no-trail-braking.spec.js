/**
 * Test E2E: Frein + Accélérateur — Trail Braking retiré (Story 2)
 *
 * Les modes "Trail Braking - Facile" et "Trail Braking - Moyen" ne doivent plus être visibles.
 * Seuls les modes Random restent disponibles.
 */

const { test, expect } = require('@playwright/test');

test.describe('Frein + Accélérateur — pas de Trail Braking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedal-wheel-drills');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('Trail Braking - Facile et Trail Braking - Moyen ne sont pas proposés', async ({ page }) => {
    const brakeAccelButton = page.locator('button.drill-option:has-text("Frein + Accélérateur")');
    await expect(brakeAccelButton).toBeVisible({ timeout: 10000 });
    await brakeAccelButton.click();
    await page.waitForTimeout(1000);

    await expect(page.locator('.ddr-config')).toBeVisible({ timeout: 5000 });

    const trailFacile = page.locator('.drill-song-item:has-text("Trail Braking - Facile")');
    const trailMoyen = page.locator('.drill-song-item:has-text("Trail Braking - Moyen")');
    await expect(trailFacile).toHaveCount(0);
    await expect(trailMoyen).toHaveCount(0);
  });

  test('Les options Random sont présentes', async ({ page }) => {
    const brakeAccelButton = page.locator('button.drill-option:has-text("Frein + Accélérateur")');
    await expect(brakeAccelButton).toBeVisible({ timeout: 10000 });
    await brakeAccelButton.click();
    await page.waitForTimeout(1000);

    const randomFacile = page.locator('.drill-song-item:has-text("Random Facile")');
    await expect(randomFacile.first()).toBeVisible({ timeout: 5000 });
  });
});
