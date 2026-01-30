/**
 * Test E2E: Drill une pédale — obligation de maintenir la pédale (Story 6)
 *
 * - Un appui trop court ne donne pas la note valide (MISS ou pas de hit).
 * - Le maintien correct valide le seuil.
 * On vérifie que l'UI de jeu est en place et que le drill peut être joué
 * (la logique de hold est dans DDRGameplayArea avec HOLD_MS).
 */

const { test, expect } = require('@playwright/test');

test.describe('Drill une pédale — maintien obligatoire', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedal-wheel-drills');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('Démarrer un drill et vérifier que la zone de jeu est active', async ({ page }) => {
    const drillUnePedaleButton = page.locator('button.drill-option:has-text("Drill une pédale")');
    await expect(drillUnePedaleButton).toBeVisible({ timeout: 10000 });
    await drillUnePedaleButton.click();
    await page.waitForTimeout(800);

    const startButton = page.locator('button.ddr-config-start-button');
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    await page.waitForTimeout(2000);

    const gameplayArea = page.locator('.ddr-gameplay-area').first();
    await expect(gameplayArea).toBeVisible({ timeout: 5000 });
  });

  test('Input maintenu (touche S) pendant 400ms pendant le drill', async ({ page }) => {
    const drillUnePedaleButton = page.locator('button.drill-option:has-text("Drill une pédale")');
    await expect(drillUnePedaleButton).toBeVisible({ timeout: 10000 });
    await drillUnePedaleButton.click();
    await page.waitForTimeout(800);
    await page.locator('button.ddr-config-start-button').click();
    await page.waitForTimeout(3000);

    await page.keyboard.down('s');
    await page.waitForTimeout(400);
    await page.keyboard.up('s');
    await page.waitForTimeout(500);

    const statsBar = page.locator('.ddr-stats-bar, [class*="stats"]').first();
    await expect(statsBar).toBeVisible({ timeout: 3000 });
  });
});
