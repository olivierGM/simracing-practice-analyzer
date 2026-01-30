import { test, expect } from '@playwright/test';

test.describe('Drills Settings Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedal-wheel-drills');
    await page.waitForLoadState('networkidle');
  });

  test('le sidebar réglages touche le bord droit (pas de gap) quand ouvert', async ({ page }) => {
    // Ouvrir le panneau réglages
    await page.getByRole('button', { name: /réglages/i }).click();

    const sidebar = page.locator('.drills-settings-sidebar-open').first();
    await expect(sidebar).toBeVisible();

    // Récupérer les dimensions (viewport peut inclure scrollbar)
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();

    // Le bord droit du sidebar doit toucher le bord droit du viewport (tolérance 3px pour arrondi)
    const sidebarRightEdge = box!.x + box!.width;
    const gap = viewportWidth - sidebarRightEdge;

    expect(gap, `Gap à droite: ${gap}px - sidebar doit toucher le bord droit`).toBeLessThanOrEqual(3);
  });

  test('le sidebar est masqué avant clic sur Réglages', async ({ page }) => {
    const sidebar = page.locator('.drills-settings-sidebar-open');
    await expect(sidebar).not.toBeVisible();
  });

  test('le sidebar affiche le titre Réglages quand ouvert', async ({ page }) => {
    await page.getByRole('button', { name: /réglages/i }).click();
    await expect(page.getByRole('heading', { name: 'Réglages' })).toBeVisible();
  });
});
