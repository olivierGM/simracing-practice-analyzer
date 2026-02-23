/**
 * E2E : filtre "Type de session" sur la page Classement.
 * Se connecte avec les identifiants de dev (dev-credentials.local ou TEST_EMAIL/TEST_PASSWORD),
 * puis vérifie que le filtre Type (Toutes / Pratique / Qualif / Course) est présent et utilisable.
 */

const path = require('path');
const fs = require('fs');
const { test, expect } = require('@playwright/test');

/** Charge email/mot de passe depuis dev-credentials.local ou process.env */
function loadTestCredentials() {
  if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
    return { email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD };
  }
  const credPath = path.join(process.cwd(), 'dev-credentials.local');
  if (!fs.existsSync(credPath)) {
    return { email: '', password: '' };
  }
  const content = fs.readFileSync(credPath, 'utf8');
  let email = '';
  let password = '';
  content.split('\n').forEach((line) => {
    const m = line.match(/^\s*TEST_EMAIL\s*=\s*(.+)\s*$/);
    if (m) email = m[1].replace(/^["']|["']$/g, '').trim();
    const p = line.match(/^\s*TEST_PASSWORD\s*=\s*(.+)\s*$/);
    if (p) password = p[1].replace(/^["']|["']$/g, '').trim();
  });
  return { email, password };
}

test.describe('Classement — filtre Type de session', () => {
  const { email, password } = loadTestCredentials();

  test.beforeEach(async ({ page }) => {
    if (!email || !password) {
      test.skip();
      return;
    }
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mot de passe').fill(password);
    await page.getByRole('button', { name: /Se connecter/ }).click();
    await expect(page).toHaveURL(/\/classement/, { timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('le filtre Type de session est visible et contient Toutes, Pratique, Qualif, Course', async ({
    page,
  }) => {
    const typeSelect = page.locator('#sessionTypeSelect');
    await expect(typeSelect).toBeVisible({ timeout: 10000 });

    await expect(typeSelect.locator('option:has-text("Toutes")')).toBeAttached();
    await expect(typeSelect.locator('option:has-text("Pratique")')).toBeAttached();
    await expect(typeSelect.locator('option:has-text("Qualif")')).toBeAttached();
    await expect(typeSelect.locator('option:has-text("Course")')).toBeAttached();
  });

  test('changer le type vers Pratique met à jour le select sans erreur', async ({ page }) => {
    const typeSelect = page.locator('#sessionTypeSelect');
    await expect(typeSelect).toBeVisible({ timeout: 10000 });

    await typeSelect.selectOption({ label: 'Pratique' });
    await expect(typeSelect).toHaveValue('FP');

    const pageContent = await page.content();
    expect(pageContent).not.toMatch(/error|Error|erreur|Erreur/);
  });

  test('changer le type vers Qualif puis Course met à jour le select', async ({ page }) => {
    const typeSelect = page.locator('#sessionTypeSelect');
    await expect(typeSelect).toBeVisible({ timeout: 10000 });

    await typeSelect.selectOption({ label: 'Qualif' });
    await expect(typeSelect).toHaveValue('Q');

    await typeSelect.selectOption({ label: 'Course' });
    await expect(typeSelect).toHaveValue('R');

    await typeSelect.selectOption({ label: 'Toutes' });
    await expect(typeSelect).toHaveValue('');
  });
});
