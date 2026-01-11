#!/bin/bash
cd "/Users/ogmegelas/Documents/practice lap"

echo "📝 Git add..."
git add .

echo "💾 Git commit..."
git commit -m "Ajout des logos de constructeurs automobiles dans le tableau principal

- Nouvelle colonne avec icônes de marques (3ème colonne)
- 13 logos téléchargés et hébergés localement (SVG + PNG)
  * SVG: Aston Martin, BMW, Honda, Lamborghini, Mercedes, Nissan, Bentley
  * PNG: Porsche, Ferrari, Audi, McLaren, Jaguar, Lexus
- Service carManufacturerService.js pour mapper carModel aux logos et noms complets
- Affichage centré (24x24px) avec fallback sur première lettre si logo manquant
- Champ 'Auto' ajouté dans la fiche pilote (section Informations du Pilote)
- Tests Playwright validés: 100% de taux de succès (19/19 logos visibles)
- Mapping complet de tous les modèles ACC (GT3, GT4, GT2)"

echo "🔀 Checkout main..."
git checkout main

echo "🔗 Merge..."
git merge add-season-filter

echo "🚀 Push..."
git push origin main

echo "✅ Done!"
