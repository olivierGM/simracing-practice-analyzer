// Serveur local simple pour partager les données
// Utilisez: node server-local.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = 'data.json';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Augmenter la limite à 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('.'));

// Middleware pour gérer les erreurs de taille
app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') {
        console.error('❌ Fichier trop volumineux:', error.message);
        res.status(413).json({ 
            error: 'Fichier trop volumineux',
            message: 'La taille des données dépasse la limite de 50MB',
            suggestion: 'Essayez avec des fichiers JSON plus petits'
        });
    } else {
        next(error);
    }
});

// Initialiser le fichier de données s'il n'existe pas
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
        sessions: [],
        processedData: {}
    }));
}

// Routes API

// GET - Récupérer toutes les données
app.get('/api/data', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la lecture des données' });
    }
});

// POST - Sauvegarder les données
app.post('/api/data', (req, res) => {
    try {
        console.log('📊 Sauvegarde des données...');
        console.log(`📁 Sessions: ${req.body.sessions?.length || 0}`);
        console.log(`💾 Taille des données: ${JSON.stringify(req.body).length} caractères`);
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
        console.log('✅ Données sauvegardées avec succès');
        res.json({ success: true, message: 'Données sauvegardées' });
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la sauvegarde',
            details: error.message 
        });
    }
});

// DELETE - Effacer toutes les données
app.delete('/api/data', (req, res) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({
            sessions: [],
            processedData: {}
        }));
        res.json({ success: true, message: 'Données effacées' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'effacement' });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur local démarré sur http://localhost:${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api/data`);
    console.log(`🌐 Application accessible sur http://localhost:${PORT}`);
});
