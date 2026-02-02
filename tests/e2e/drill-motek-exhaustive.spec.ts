/**
 * Tests E2E exhaustifs : Drill complet Motek
 * - Fichiers sample Barcelona (.ldx, .ld)
 * - Upload, preview, démarrage, input detection
 */

import path from "path";
import { test, expect } from "@playwright/test";

const BARCELONA_LDX = path.join(
  __dirname,
  "../fixtures/Barcelona-sample.ldx"
);
const MOTEK_VALID = path.join(__dirname, "../fixtures/motek-valid.ldx");
const MOTEK_INVALID = path.join(__dirname, "../fixtures/motek-invalid.txt");
const BARCELONA_LD = path.join(
  __dirname,
  "../../assets/data/Motec Sample/Barcelona-bmw_m4_gt3-3-2024.06.12-18.40.53.ld"
);

test.describe("Drill Motek - Tests exhaustifs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pedal-wheel-drills");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector(".drills-type-cards, .drills-home-loading", {
      timeout: 60000,
    });
    await page.waitForTimeout(2000);
  });

  test("1. Carte Drill Complet Motek visible", async ({ page }) => {
    const card = page
      .getByRole("button", { name: /Drill Complet Motek/i })
      .or(page.getByTestId("drill-card-motek"));
    await expect(card.first()).toBeVisible({ timeout: 15000 });
  });

  test("2a. Bouton Test Barcelona M4 -> étapes détectées (fichier avec marqueurs)", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /Drill Complet Motek/i }).first().click();
    await page.waitForTimeout(300);

    await page.getByTestId("drill-motek-sample-barcelona").click();
    await page.waitForTimeout(500);

    const preview = page.getByTestId("drill-motek-preview");
    await expect(preview).toBeVisible({ timeout: 3000 });
    await expect(preview).toContainText("Barcelona");
    await expect(preview).toContainText("étape");

    const startBtn = page.getByTestId("drill-start-button");
    await expect(startBtn).toBeEnabled();
    await startBtn.click();
    await page.waitForTimeout(1000);

    const gameplay = page.getByTestId("drill-complet-active");
    await expect(gameplay).toBeVisible({ timeout: 5000 });
  });

  test("2b. Fichier .ldx vide (fixture) -> fallback 102s Barcelona", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /Drill Complet Motek/i }).first().click();
    await page.waitForTimeout(300);

    const fileInput = page.getByTestId("drill-motek-file-input");
    await fileInput.setInputFiles(BARCELONA_LDX);
    await page.waitForTimeout(500);

    const preview = page.getByTestId("drill-motek-preview");
    await expect(preview).toBeVisible({ timeout: 3000 });
    await expect(preview).toContainText("Barcelona");
    await expect(preview).toContainText("Mode aléatoire");
    await expect(preview).toContainText("102");
  });

  test("3. Fichier .ldx avec Marker -> preview étapes", async ({ page }) => {
    await page.getByRole("button", { name: /Drill Complet Motek/i }).first().click();
    await page.waitForTimeout(300);

    await page.getByTestId("drill-motek-file-input").setInputFiles(MOTEK_VALID);
    await page.waitForTimeout(500);

    const preview = page.getByTestId("drill-motek-preview");
    await expect(preview).toBeVisible();
    await expect(preview).toContainText("3 étape");
  });

  test("4. Fichier .ld binaire -> erreur explicite", async ({ page }) => {
    await page.getByRole("button", { name: /Drill Complet Motek/i }).first().click();
    await page.waitForTimeout(300);

    await page.getByTestId("drill-motek-file-input").setInputFiles(BARCELONA_LD);
    await page.waitForTimeout(500);

    const error = page.getByTestId("drill-motek-error");
    await expect(error).toBeVisible({ timeout: 3000 });
    await expect(error).toContainText(/binaire|non supporté/i);
  });

  test("5. Fichier invalide (.txt) -> erreur", async ({ page }) => {
    await page.getByRole("button", { name: /Drill Complet Motek/i }).first().click();
    await page.waitForTimeout(300);

    await page.getByTestId("drill-motek-file-input").setInputFiles(MOTEK_INVALID);
    await page.waitForTimeout(500);

    const error = page.getByTestId("drill-motek-error");
    await expect(error).toBeVisible({ timeout: 3000 });
  });

  test("6. Panneau Réglages + input detection visible", async ({ page }) => {
    await page.getByRole("button", { name: /Réglages/i }).first().click();
    await page.waitForTimeout(300);

    const panel = page.locator(".drills-settings-panel-inner");
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Réglages");
    await expect(panel.locator("text=Frein").or(panel.locator("text=Accélérateur")).first()).toBeVisible();
  });

  test("7. Drill en cours : barre inputs visible", async ({ page }) => {
    await page.getByRole("button", { name: /Drill Complet Motek/i }).first().click();
    await page.waitForTimeout(300);
    await page.getByTestId("drill-motek-sample-barcelona").click();
    await page.waitForTimeout(500);
    await page.getByTestId("drill-start-button").click();
    await page.waitForTimeout(800);

    const inputsBar = page.locator(".ddr-inputs-bar");
    await expect(inputsBar).toBeVisible({ timeout: 3000 });
    await expect(inputsBar).toContainText("%");
  });
});
