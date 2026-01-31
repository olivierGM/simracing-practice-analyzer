/**
 * Test E2E: Drill complet Motek (Story 1, 4, 5)
 *
 * - Le drill "Drill complet Motek" apparaît dans la liste
 * - Upload fichier valide -> preview -> démarrer -> état en cours
 * - Fichier invalide -> erreur visible
 */

import path from 'path';
import { test, expect } from '@playwright/test';

const FIXTURE_VALID = path.join(__dirname, '../fixtures/motek-valid.ldx');
const FIXTURE_INVALID = path.join(__dirname, '../fixtures/motek-invalid.txt');

test.describe('Drill complet Motek', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedal-wheel-drills');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.drills-type-cards, .drills-home-loading', { timeout: 60000 });
    await page.waitForTimeout(2000);
  });

  test('le drill Motek apparaît dans les cartes', async ({ page }) => {
    const motekCard = page.getByRole('button', { name: /Drill Complet Motek/i }).or(
      page.getByTestId('drill-card-motek')
    );
    await expect(motekCard.first()).toBeVisible({ timeout: 15000 });
  });

  test('upload fichier valide -> preview -> démarrer -> drill en cours', async ({ page }) => {
    await page.getByRole('button', { name: /Drill Complet Motek/i }).first().click();
    await page.waitForTimeout(300);

    const uploadSection = page.getByTestId('drill-motek-upload');
    await expect(uploadSection).toBeVisible();

    const fileInput = page.getByTestId('drill-motek-file-input');
    await fileInput.setInputFiles(FIXTURE_VALID);
    await page.waitForTimeout(500);

    const preview = page.getByTestId('drill-motek-preview');
    await expect(preview).toBeVisible({ timeout: 3000 });
    await expect(preview).toContainText('motek-valid');

    const startBtn = page.getByTestId('drill-start-button');
    await expect(startBtn).toBeEnabled();
    await startBtn.click();
    await page.waitForTimeout(800);

    const gameplayArea = page.getByTestId('drill-complet-active');
    await expect(gameplayArea).toBeVisible({ timeout: 5000 });
  });

  test('fichier invalide -> erreur visible', async ({ page }) => {
    await page.getByRole('button', { name: /Drill Complet Motek/i }).first().click();
    await page.waitForTimeout(300);

    const fileInput = page.getByTestId('drill-motek-file-input');
    await fileInput.setInputFiles(FIXTURE_INVALID);
    await page.waitForTimeout(500);

    const error = page.getByTestId('drill-motek-error');
    await expect(error).toBeVisible({ timeout: 3000 });
  });
});
