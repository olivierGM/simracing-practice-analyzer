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
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBOyMeW0kxC3d9pP5VsYr2czQfBJQYdjTs",
  authDomain: "simracing-practice-analyzer.firebaseapp.com",
  projectId: "simracing-practice-analyzer",
  storageBucket: "simracing-practice-analyzer.appspot.com",
  messagingSenderId: "377068056867",
  appId: "1:377068056867:web:d7c2a3f4e5b6c7d8e9f0a1"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Récupère les résultats depuis Firebase Storage
 * 
 * @returns {Promise<Object>} Données des résultats
 */
export async function fetchResults() {
  try {
    const storageRef = ref(storage, 'results/latest/combined_results.json');
    const url = await getDownloadURL(storageRef);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching results:', error);
    throw error;
  }
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
    
    throw new Error('No metadata found in Firestore');
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
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

