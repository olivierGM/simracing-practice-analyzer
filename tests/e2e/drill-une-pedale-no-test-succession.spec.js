/**
 * Test E2E: Drill une pédale — Test-Succession Basique retiré (Story 4)
 *
 * Le drill "Test - Succession Basique" ne doit plus apparaître dans la liste.
 */

const { test, expect } = require('@playwright/test');

test.describe('Drill une pédale — pas de Test-Succession Basique', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedal-wheel-drills');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('Test - Succession Basique n\'apparaît pas dans la liste des drills', async ({ page }) => {
    const drillUnePedaleButton = page.locator('button.drill-option:has-text("Drill une pédale")');
    await expect(drillUnePedaleButton).toBeVisible({ timeout: 10000 });
    await drillUnePedaleButton.click();
    await page.waitForTimeout(1200);

    await expect(page.locator('.ddr-config')).toBeVisible({ timeout: 5000 });

    const testSuccession = page.locator('.drill-song-item:has-text("Test-Succession Basique"), .drill-song-item:has-text("Test - Succession Basique")');
    await expect(testSuccession).toHaveCount(0);
  });
});
