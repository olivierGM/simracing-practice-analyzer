#!/bin/bash

cd "/Users/ogmegelas/Documents/practice lap/frontend/public/logos"

echo "Téléchargement des logos Ferrari, Bentley et Nissan..."

# Ferrari - Essai depuis brandlogos.net
echo "1/3 - Téléchargement Ferrari..."
curl -k -L -o ferrari.png "https://1000logos.net/wp-content/uploads/2018/02/Ferrari-Logo.png"
sleep 3

# Bentley - Essai depuis brandlogos
echo "2/3 - Téléchargement Bentley..."
curl -k -L -o bentley.png "https://1000logos.net/wp-content/uploads/2018/02/Bentley-Logo.png"
sleep 3

# Nissan - Essai depuis brandlogos
echo "3/3 - Téléchargement Nissan..."
curl -k -L -o nissan.png "https://1000logos.net/wp-content/uploads/2018/02/Nissan-Logo.png"

echo ""
echo "Vérification des fichiers téléchargés..."
file ferrari.png bentley.png nissan.png

echo ""
echo "Taille des fichiers:"
ls -lh ferrari.png bentley.png nissan.png
