/**
 * Session Storage - Gestion du stockage des sessions dans Firestore
 */

const admin = require('firebase-admin');

/**
 * Récupère toutes les sessions existantes depuis Firestore
 * @returns {Promise<Array>} Liste des sessions existantes
 */
async function getExistingSessions() {
    try {
        console.log('📥 Récupération des sessions existantes depuis Firestore...');
        
        const snapshot = await admin.firestore()
            .collection('sessions')
            .get();
        
        const sessions = [];
        snapshot.forEach(doc => {
            sessions.push(doc.data());
        });
        
        console.log(`📊 ${sessions.length} sessions existantes trouvées`);
        return sessions;
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des sessions existantes:', error);
        throw error;
    }
}

/**
 * Sauvegarde une nouvelle session dans Firestore
 * @param {Object} sessionData - Données de la session
 * @returns {Promise<string>} ID du document créé
 */
async function saveSession(sessionData) {
    try {
        const docRef = await admin.firestore()
            .collection('sessions')
            .add({
                ...sessionData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                source: 'egt_scraper'
            });
        
        console.log(`💾 Session sauvegardée: ${docRef.id}`);
        return docRef.id;
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde de la session:', error);
        throw error;
    }
}

/**
 * Sauvegarde plusieurs sessions en batch
 * @param {Array} sessions - Liste des sessions à sauvegarder
 * @returns {Promise<Object>} Résultats de la sauvegarde
 */
async function saveMultipleSessions(sessions) {
    if (!sessions || sessions.length === 0) {
        console.log('📝 Aucune session à sauvegarder');
        return { saved: 0, failed: 0, errors: [] };
    }
    
    const batch = admin.firestore().batch();
    const savedSessions = [];
    const errors = [];
    
    try {
        console.log(`💾 Sauvegarde en batch de ${sessions.length} sessions...`);
        
        sessions.forEach((sessionData, index) => {
            try {
                const docRef = admin.firestore().collection('sessions').doc();
                
                batch.set(docRef, {
                    ...sessionData,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    source: 'egt_scraper'
                });
                
                savedSessions.push({
                    id: docRef.id,
                    sessionId: sessionData._scrapedMetadata?.originalSessionId
                });
                
            } catch (error) {
                errors.push({
                    index: index,
                    sessionId: sessionData._scrapedMetadata?.originalSessionId,
                    error: error.message
                });
            }
        });
        
        // Exécuter le batch
        await batch.commit();
        
        console.log(`✅ ${savedSessions.length} sessions sauvegardées avec succès`);
        if (errors.length > 0) {
            console.warn(`⚠️ ${errors.length} erreurs lors de la sauvegarde`);
        }
        
        return {
            saved: savedSessions.length,
            failed: errors.length,
            savedSessions: savedSessions,
            errors: errors
        };
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde en batch:', error);
        throw error;
    }
}

/**
 * Génère un ID de session (même logique que le frontend)
 * @param {Object} session - Objet session avec trackName et Date
 * @returns {string} ID unique de la session
 */
function generateSessionId(session) {
    const trackName = session.trackName || 'Unknown';
    const date = session.Date || new Date().toISOString();
    return `${trackName}_${date}`;
}

/**
 * Vérifie si une session existe déjà
 * @param {string} sessionId - ID de la session à vérifier
 * @returns {Promise<boolean>} True si la session existe
 */
async function sessionExists(sessionId) {
    try {
        const snapshot = await admin.firestore()
            .collection('sessions')
            .where('_scrapedMetadata.originalSessionId', '==', sessionId)
            .limit(1)
            .get();
        
        return !snapshot.empty;
        
    } catch (error) {
        console.error(`❌ Erreur lors de la vérification de l'existence de la session ${sessionId}:`, error);
        return false; // En cas d'erreur, on considère que la session n'existe pas
    }
}

/**
 * Récupère le nombre total de sessions
 * @returns {Promise<number>} Nombre total de sessions
 */
async function getSessionCount() {
    try {
        const snapshot = await admin.firestore()
            .collection('sessions')
            .get();
        
        return snapshot.size;
        
    } catch (error) {
        console.error('❌ Erreur lors du comptage des sessions:', error);
        return 0;
    }
}

/**
 * Met à jour les données traitées dans Firestore (comme dans le frontend)
 * @param {Object} processedData - Données traitées à sauvegarder
 * @returns {Promise<void>}
 */
async function updateProcessedData(processedData) {
    try {
        console.log('💾 Mise à jour des données traitées...');
        
        // Diviser en plusieurs documents pour éviter la limite de 1MB
        const batch = admin.firestore().batch();
        
        // Document overall
        const overallRef = admin.firestore().collection('processedData').doc('overall');
        batch.set(overallRef, processedData.overall || {});
        
        // Document byCategory
        const byCategoryRef = admin.firestore().collection('processedData').doc('byCategory');
        batch.set(byCategoryRef, processedData.byCategory || {});
        
        // Document byDriver
        const byDriverRef = admin.firestore().collection('processedData').doc('byDriver');
        batch.set(byDriverRef, processedData.byDriver || {});
        
        // Document metadata
        const metadataRef = admin.firestore().collection('processedData').doc('metadata');
        batch.set(metadataRef, {
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            totalSessions: processedData.totalSessions || 0,
            version: '1.0'
        });
        
        await batch.commit();
        console.log('✅ Données traitées mises à jour avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des données traitées:', error);
        throw error;
    }
}

module.exports = {
    getExistingSessions,
    saveSession,
    saveMultipleSessions,
    generateSessionId,
    sessionExists,
    getSessionCount,
    updateProcessedData
};
