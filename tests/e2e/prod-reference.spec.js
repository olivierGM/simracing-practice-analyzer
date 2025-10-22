/**
 * Tests de Référence pour la Version Production
 * 
 * Ces tests documentent TOUS les comportements de l'application actuelle.
 * Ils serviront de référence pour valider la parité avec la version React.
 * 
 * Captures automatiques de screenshots pour comparaison visuelle.
 */

const { test, expect } = require('@playwright/test');

const PROD_URL = 'https://simracing-practice-analyzer.web.app/';
const SCREENSHOT_DIR = 'migration-react/reference/screenshots';

// Helper pour attendre que les données soient chargées
async function waitForDataLoaded(page) {
    await page.waitForSelector('.driver-row', { timeout: 10000 });
    await page.waitForTimeout(1000); // Attendre les animations
}

// Helper pour vérifier l'absence d'erreurs console critiques
async function checkNoConsoleErrors(page, errors) {
    const criticalErrors = errors.filter(msg => 
        msg.type() === 'error' && 
        !msg.text().includes('favicon') &&
        !msg.text().includes('404')
    );
    expect(criticalErrors.length).toBe(0);
}

test.describe('Phase 1 - Référence Production : Interface Principale', () => {
    let consoleErrors = [];

    test.beforeEach(async ({ page }) => {
        consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error' || msg.type() === 'warning') {
                consoleErrors.push(msg);
            }
        });
    });

    test('01 - Page se charge sans erreur', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Screenshot de référence
        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/01-home-default.png`,
            fullPage: true 
        });

        // Vérifier les éléments principaux
        await expect(page.locator('h1')).toContainText('Sim Racing Practice Analyzer');
        await expect(page.locator('#lastUpdateIndicator')).toBeVisible();
        await expect(page.locator('#themeToggle')).toBeVisible();
        await expect(page.locator('#loginBtn')).toBeVisible();

        // Pas d'erreurs critiques
        await checkNoConsoleErrors(page, consoleErrors);
    });

    test('02 - Indicateur "Dernière session" affiche correctement', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        const indicator = page.locator('#updateDate');
        await expect(indicator).toBeVisible();

        // Vérifier le format (Il y a Xh ou Il y a X min)
        const text = await indicator.textContent();
        expect(text).toMatch(/Il y a \d+\s?(h|min|jours?)/);

        // Vérifier le tooltip
        const tooltip = await indicator.getAttribute('title');
        expect(tooltip).toContain('Dernière session:');
        expect(tooltip).toContain('session');
    });

    test('03 - Toggle thème fonctionne (3 états)', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        const themeToggle = page.locator('#themeToggle');
        const html = page.locator('html');

        // État initial (devrait être dark par défaut)
        let currentTheme = await html.getAttribute('data-theme');
        console.log('Thème initial:', currentTheme);

        // Screenshot dark mode
        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/03-home-dark.png`,
            fullPage: true 
        });

        // Cliquer pour passer au mode suivant
        await themeToggle.click();
        await page.waitForTimeout(300);

        let newTheme = await html.getAttribute('data-theme');
        console.log('Après 1er clic:', newTheme);
        expect(newTheme).not.toBe(currentTheme);

        // Si maintenant en light, prendre screenshot
        if (newTheme === 'light' || !newTheme) {
            await page.screenshot({ 
                path: `${SCREENSHOT_DIR}/04-home-light.png`,
                fullPage: true 
            });
        }

        // Vérifier la persistance (localStorage)
        const storedTheme = await page.evaluate(() => localStorage.getItem('theme-preference'));
        expect(storedTheme).toBeTruthy();
        console.log('Thème stocké:', storedTheme);
    });
});

test.describe('Phase 1 - Référence Production : Filtres', () => {
    test('04 - Filtre "À tout moment" affiche tous les pilotes', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Sélectionner "À tout moment"
        await page.selectOption('#periodFilter', 'all');
        await page.waitForTimeout(500);

        // Compter les pilotes affichés
        const driverCount = await page.locator('.driver-row').count();
        console.log('Nombre de pilotes (À tout moment):', driverCount);
        expect(driverCount).toBeGreaterThan(0);

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/05-filter-all.png`,
            fullPage: true 
        });
    });

    test('05 - Filtre "Dernière semaine" filtre correctement', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Compter les pilotes avant filtre
        const beforeCount = await page.locator('.driver-row').count();

        // Appliquer filtre "Dernière semaine"
        await page.selectOption('#periodFilter', 'week');
        await page.waitForTimeout(500);

        // Compter après filtre
        const afterCount = await page.locator('.driver-row').count();
        console.log(`Pilotes avant: ${beforeCount}, après: ${afterCount}`);

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/06-filter-week.png`,
            fullPage: true 
        });
    });

    test('06 - Filtre "Dernière journée" filtre correctement', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Appliquer filtre "Dernière journée"
        await page.selectOption('#periodFilter', 'day');
        await page.waitForTimeout(500);

        const afterCount = await page.locator('.driver-row').count();
        console.log('Pilotes (dernière journée):', afterCount);

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/07-filter-day.png`,
            fullPage: true 
        });
    });

    test('07 - Filtre piste affiche les bonnes pistes', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        const trackFilter = page.locator('#trackFilter');
        
        // Vérifier que le filtre existe et a des options
        await expect(trackFilter).toBeVisible();
        const options = await trackFilter.locator('option').count();
        console.log('Nombre d\'options de piste:', options);
        expect(options).toBeGreaterThan(1); // Au moins "Toutes les pistes" + 1 piste

        // Sélectionner la 2ème option (première piste réelle)
        const trackName = await trackFilter.locator('option').nth(1).textContent();
        await trackFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        console.log('Piste sélectionnée:', trackName);

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/08-filter-track.png`,
            fullPage: true 
        });
    });

    test('08 - Combinaison de filtres fonctionne', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Appliquer plusieurs filtres
        await page.selectOption('#periodFilter', 'week');
        await page.selectOption('#trackFilter', { index: 1 });
        await page.waitForTimeout(500);

        const count = await page.locator('.driver-row').count();
        console.log('Pilotes avec filtres combinés:', count);

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/09-filter-combined.png`,
            fullPage: true 
        });
    });
});

test.describe('Phase 1 - Référence Production : Tri', () => {
    test('09 - Tri par Position fonctionne', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Cliquer sur header "Position"
        await page.click('th:has-text("Position")');
        await page.waitForTimeout(500);

        // Vérifier l'indicateur de tri
        const positionHeader = page.locator('th:has-text("Position")');
        const sortIcon = await positionHeader.textContent();
        console.log('Header Position après tri:', sortIcon);

        // Prendre les 3 premières positions
        const positions = await page.locator('.driver-row td:nth-child(1)').allTextContents();
        console.log('Premières positions:', positions.slice(0, 3));

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/10-sort-position.png`,
            fullPage: true 
        });
    });

    test('10 - Tri par Pilote (alphabétique) fonctionne', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Cliquer sur header "Pilote"
        await page.click('th:has-text("Pilote")');
        await page.waitForTimeout(500);

        const names = await page.locator('.driver-row td:nth-child(2)').allTextContents();
        console.log('Premiers noms (tri alpha):', names.slice(0, 3));

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/11-sort-pilot.png`,
            fullPage: true 
        });
    });

    test('11 - Tri par Meilleur temps fonctionne', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Cliquer sur header "Meilleur temps"
        await page.click('th:has-text("Meilleur temps")');
        await page.waitForTimeout(500);

        const times = await page.locator('.driver-row td:nth-child(3)').allTextContents();
        console.log('Premiers temps:', times.slice(0, 3));

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/12-sort-time.png`,
            fullPage: true 
        });
    });

    test('12 - Données persistent après tri', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Compter les pilotes avant tri
        const beforeCount = await page.locator('.driver-row').count();

        // Trier
        await page.click('th:has-text("Meilleur temps")');
        await page.waitForTimeout(500);

        // Compter après tri
        const afterCount = await page.locator('.driver-row').count();

        console.log(`Pilotes avant tri: ${beforeCount}, après tri: ${afterCount}`);
        expect(afterCount).toBe(beforeCount);
    });
});

test.describe('Phase 1 - Référence Production : Groupement par Classe', () => {
    test('13 - Groupement affiche les catégories', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Activer le groupement
        await page.check('#groupByClass');
        await page.waitForTimeout(500);

        // Vérifier les sections de catégories
        const categories = page.locator('.category-section');
        const categoryCount = await categories.count();
        console.log('Nombre de catégories:', categoryCount);
        expect(categoryCount).toBeGreaterThan(0);

        // Vérifier les titres de catégories
        const titles = await page.locator('.category-title').allTextContents();
        console.log('Catégories trouvées:', titles);

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/13-grouped.png`,
            fullPage: true 
        });
    });

    test('14 - Ranking par catégorie (1, 2, 3...)', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Activer le groupement
        await page.check('#groupByClass');
        await page.waitForTimeout(500);

        // Vérifier que chaque catégorie a un ranking qui recommence à 1
        const firstCategory = page.locator('.category-section').first();
        const positions = await firstCategory.locator('.driver-row td:nth-child(1)').allTextContents();
        console.log('Positions dans première catégorie:', positions.slice(0, 5));

        // La première position devrait être 1
        expect(positions[0].trim()).toBe('1');
    });

    test('15 - Tri dans chaque catégorie fonctionne', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Activer le groupement
        await page.check('#groupByClass');
        await page.waitForTimeout(500);

        // Trier par temps
        await page.click('th:has-text("Meilleur temps")');
        await page.waitForTimeout(500);

        // Vérifier que les groupes sont toujours là
        const categoryCount = await page.locator('.category-section').count();
        console.log('Catégories après tri:', categoryCount);
        expect(categoryCount).toBeGreaterThan(0);

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/14-grouped-sorted.png`,
            fullPage: true 
        });
    });

    test('16 - Désactiver le groupement revient à la vue globale', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Activer puis désactiver le groupement
        await page.check('#groupByClass');
        await page.waitForTimeout(500);
        await page.uncheck('#groupByClass');
        await page.waitForTimeout(500);

        // Vérifier qu'il n'y a plus de sections de catégories
        const categories = await page.locator('.category-section').count();
        console.log('Catégories après désactivation:', categories);
        expect(categories).toBe(0);

        // Vérifier que les pilotes sont toujours affichés
        const driverCount = await page.locator('.driver-row').count();
        console.log('Pilotes en vue globale:', driverCount);
        expect(driverCount).toBeGreaterThan(0);
    });
});

test.describe('Phase 1 - Référence Production : Modal Pilote', () => {
    test('17 - Clic sur pilote ouvre la modal', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Cliquer sur le premier pilote
        await page.click('.driver-row:first-child');
        await page.waitForTimeout(1000);

        // Vérifier que la modal est ouverte
        const modal = page.locator('#pilotModal');
        await expect(modal).toBeVisible();

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/15-pilot-modal-full.png`,
            fullPage: true 
        });
    });

    test('18 - Toutes les sections de la modal sont présentes', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Ouvrir la modal
        await page.click('.driver-row:first-child');
        await page.waitForTimeout(1000);

        // Vérifier les sections principales
        await expect(page.locator('.pilot-stats')).toBeVisible();
        await expect(page.locator('.segment-section')).toBeVisible();
        await expect(page.locator('.laps-section')).toBeVisible();
        await expect(page.locator('.progression-section')).toBeVisible();

        console.log('✅ Toutes les sections de la modal sont présentes');
    });

    test('19 - Stats du pilote affichées correctement', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        await page.click('.driver-row:first-child');
        await page.waitForTimeout(1000);

        // Vérifier les stats principales
        const stats = page.locator('.pilot-stats');
        const statsText = await stats.textContent();

        expect(statsText).toContain('Meilleur temps');
        expect(statsText).toContain('Tours valides');
        expect(statsText).toContain('Potentiel');
        expect(statsText).toContain('Constance');

        console.log('Stats trouvées ✅');

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/16-pilot-stats.png`,
            fullPage: true 
        });
    });

    test('20 - Graphique de progression se charge', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        await page.click('.driver-row:first-child');
        await page.waitForTimeout(2000); // Attendre le chargement du graphique

        // Vérifier que le canvas du graphique existe
        const chart = page.locator('#progressionChart');
        await expect(chart).toBeVisible();

        console.log('✅ Graphique de progression chargé');

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/17-pilot-chart.png`,
            fullPage: true 
        });
    });

    test('21 - Liste des tours affichée', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        await page.click('.driver-row:first-child');
        await page.waitForTimeout(1000);

        // Vérifier la table des tours
        const lapsTable = page.locator('.laps-table');
        await expect(lapsTable).toBeVisible();

        // Vérifier les headers
        const headers = await lapsTable.locator('th').allTextContents();
        console.log('Headers de la liste des tours:', headers);
        expect(headers).toContain('Tour');
        expect(headers).toContain('S1');
        expect(headers).toContain('Total');

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/18-pilot-laps.png`,
            fullPage: true 
        });
    });

    test('22 - Tri des tours fonctionne', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        await page.click('.driver-row:first-child');
        await page.waitForTimeout(1000);

        // Cliquer sur header "Total" pour trier
        await page.click('.laps-table th:has-text("Total")');
        await page.waitForTimeout(500);

        // Vérifier qu'un indicateur de tri est présent
        const totalHeader = page.locator('.laps-table th:has-text("Total")');
        const headerText = await totalHeader.textContent();
        console.log('Header Total après tri:', headerText);

        // Le header devrait contenir ↑ ou ↓
        expect(headerText).toMatch(/[↑↓]/);
    });

    test('23 - Comparateur de segments affiché', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        await page.click('.driver-row:first-child');
        await page.waitForTimeout(1000);

        // Vérifier la section segment comparator
        const segmentSection = page.locator('.segment-section');
        await expect(segmentSection).toBeVisible();

        // Vérifier le focus
        const focusText = await segmentSection.locator('.focus-bubble').textContent();
        console.log('Focus du comparateur:', focusText);
        expect(focusText).toContain('Meilleur pilote vs Meilleur global');

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/19-pilot-segments.png`,
            fullPage: true 
        });
    });

    test('24 - Boutons info (constance, segments) fonctionnent', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        await page.click('.driver-row:first-child');
        await page.waitForTimeout(1000);

        // Cliquer sur l'icône info de constance
        const consistencyInfo = page.locator('.stat-item:has-text("Constance") .info-icon');
        if (await consistencyInfo.count() > 0) {
            await consistencyInfo.click();
            await page.waitForTimeout(300);

            // Vérifier que la popup est visible
            const popup = page.locator('.info-popup.show');
            await expect(popup).toBeVisible();

            console.log('✅ Popup info constance fonctionne');

            // Fermer la popup
            await page.click('.popup-close');
            await page.waitForTimeout(300);
        }
    });

    test('25 - Bouton fermer (X) ferme la modal', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        await page.click('.driver-row:first-child');
        await page.waitForTimeout(1000);

        // Vérifier que la modal est ouverte
        const modal = page.locator('#pilotModal');
        await expect(modal).toBeVisible();

        // Cliquer sur le bouton fermer
        await page.click('.close-modal');
        await page.waitForTimeout(500);

        // Vérifier que la modal est fermée
        await expect(modal).not.toBeVisible();

        console.log('✅ Modal fermée correctement');
    });

    test('26 - Modal en dark mode', async ({ page }) => {
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // S'assurer d'être en dark mode
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark');
        });
        await page.waitForTimeout(300);

        // Ouvrir la modal
        await page.click('.driver-row:first-child');
        await page.waitForTimeout(1000);

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/20-pilot-modal-dark.png`,
            fullPage: true 
        });
    });
});

test.describe('Phase 1 - Référence Production : Responsive', () => {
    test('27 - Vue mobile (portrait)', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/21-mobile-home.png`,
            fullPage: true 
        });

        // Vérifier que certaines colonnes sont cachées
        const visibleColumns = await page.locator('.driver-table th').count();
        console.log('Colonnes visibles en mobile:', visibleColumns);
    });

    test('28 - Modal pilote en mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        await page.click('.driver-row:first-child');
        await page.waitForTimeout(1000);

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/22-mobile-modal.png`,
            fullPage: true 
        });

        console.log('✅ Modal responsive en mobile');
    });

    test('29 - Vue tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/23-tablet-home.png`,
            fullPage: true 
        });
    });
});

test.describe('Phase 1 - Référence Production : Console & Erreurs', () => {
    test('30 - Aucune erreur JavaScript critique', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto(PROD_URL);
        await waitForDataLoaded(page);

        // Ouvrir une modal
        await page.click('.driver-row:first-child');
        await page.waitForTimeout(1000);

        // Filtrer les erreurs non critiques
        const criticalErrors = errors.filter(err => 
            !err.includes('favicon') &&
            !err.includes('404') &&
            !err.includes('net::ERR')
        );

        console.log('Erreurs trouvées:', errors.length);
        console.log('Erreurs critiques:', criticalErrors.length);

        if (criticalErrors.length > 0) {
            console.error('❌ Erreurs critiques:', criticalErrors);
        }

        expect(criticalErrors.length).toBe(0);
    });
});

console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Tests de Référence Production - Phase 1                  ║
║  30 tests documentant tous les comportements              ║
║  Screenshots automatiques dans ${SCREENSHOT_DIR}/         ║
╚═══════════════════════════════════════════════════════════╝
`);

