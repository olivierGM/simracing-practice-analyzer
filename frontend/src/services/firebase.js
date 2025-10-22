/**
 * Service Firebase
 * 
 * Gère toutes les interactions avec Firebase :
 * - Authentication (admin)
 * - Firestore (métadonnées)
 * - Storage (fichiers JSON)
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// Configuration Firebase - VRAIE config de prod
const firebaseConfig = {
  apiKey: "AIzaSyDufNena1-qBKkCLD0aXm3uBJnUr7VLBCE",
  authDomain: "simracing-practice-analyzer.firebaseapp.com",
  projectId: "simracing-practice-analyzer",
  storageBucket: "simracing-practice-analyzer.firebasestorage.app",
  messagingSenderId: "465814736031",
  appId: "1:465814736031:web:b06b6e25a511c90d40a6aa",
  measurementId: "G-K33TDY8WJE"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Récupère les sessions depuis Firestore (COMME EN PROD)
 * 
 * @returns {Promise<Array>} Données des sessions
 */
export async function fetchSessions() {
  try {
    console.log('🔄 Chargement des sessions depuis Firestore...');
    
    const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
    const sessions = [];
    
    sessionsSnapshot.forEach(doc => {
      sessions.push(doc.data());
    });
    
    console.log(`📊 ${sessions.length} sessions chargées depuis Firestore`);
    
    return sessions;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
}

/**
 * Récupère les résultats (pour compatibilité - retourne les sessions)
 * 
 * @returns {Promise<Object>} Données des résultats
 */
export async function fetchResults() {
  const sessions = await fetchSessions();
  return { sessions };
}

/**
 * Récupère les métadonnées depuis Firestore
 * 
 * @returns {Promise<Object>} Métadonnées
 */
export async function fetchMetadata() {
  try {
    const docRef = doc(db, 'results', 'latest');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    
    // Pas critique si les metadata n'existent pas
    console.warn('No metadata found in Firestore (non-critique)');
    return null;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null; // Ne pas throw, juste retourner null
  }
}

/**
 * Login admin avec email/password
 * 
 * @param {string} email - Email de l'admin
 * @param {string} password - Mot de passe
 * @returns {Promise<UserCredential>} Credentials de l'utilisateur
 */
export async function loginAdmin(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

/**
 * Logout admin
 * 
 * @returns {Promise<void>}
 */
export async function logoutAdmin() {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

/**
 * Observer l'état d'authentification
 * 
 * @param {Function} callback - Fonction appelée quand l'état change
 * @returns {Function} Fonction de unsubscribe
 */
export function onAuthChanged(callback) {
  return onAuthStateChanged(auth, callback);
}

