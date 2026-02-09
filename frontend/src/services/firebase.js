/**
 * Service Firebase
 * 
 * Gère toutes les interactions avec Firebase :
 * - Authentication (admin)
 * - Firestore (métadonnées)
 * - Storage (fichiers JSON)
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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
export const app = initializeApp(firebaseConfig);
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
 * Connexion avec email/password (admin ou utilisateur)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export async function login(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

/** @deprecated Use login() */
export async function loginAdmin(email, password) {
  return login(email, password);
}

/**
 * Inscription d'un nouvel utilisateur
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user.uid, { email });
    return userCredential;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

/**
 * Connexion avec un compte Google (popup)
 * Crée le profil Firestore si première connexion.
 * @returns {Promise<UserCredential>}
 */
export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const { uid, email, displayName } = userCredential.user;
    const existing = await getUserProfile(uid);
    if (!existing) {
      await createUserProfile(uid, { email: email || '', displayName: displayName || '' });
    }
    return userCredential;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

/**
 * Logout
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

/** @deprecated Use logout() */
export async function logoutAdmin() {
  return logout();
}

/**
 * Observer l'état d'authentification
 * @param {Function} callback - Fonction appelée quand l'état change
 * @returns {Function} Fonction de unsubscribe
 */
export function onAuthChanged(callback) {
  return onAuthStateChanged(auth, callback);
}

// --- Firestore: profil utilisateur (users/{uid}) ---

/**
 * Crée le document profil pour un nouvel utilisateur
 * @param {string} uid
 * @param {Object} data - { email, displayName? }
 */
export async function createUserProfile(uid, data = {}) {
  const ref = doc(db, 'users', uid);
  // Déterminer le rôle : admin si email = cow.killa@gmail.com, sinon 'user'
  const role = data.email === 'cow.killa@gmail.com' ? 'admin' : 'user';
  await setDoc(ref, {
    email: data.email || '',
    displayName: data.displayName || '',
    role, // 'admin' ou 'user'
    linkedPilotId: data.linkedPilotId || null,
    theme: data.theme || null,
    deviceMapping: data.deviceMapping || null,
    favorites: data.favorites || { pilotIds: [], trackIds: [] },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/**
 * Récupère le profil utilisateur depuis Firestore
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Met à jour le profil / préférences utilisateur (champs partiels)
 * @param {string} uid
 * @param {Object} data - champs à mettre à jour (linkedPilotId, theme, deviceMapping, favorites, displayName, role)
 */
export async function updateUserProfile(uid, data) {
  if (!uid) return;
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

/**
 * Met à jour le rôle d'un utilisateur (utilitaire pour migration)
 * @param {string} uid
 * @param {string} role - 'admin' ou 'user'
 */
export async function updateUserRole(uid, role) {
  if (!uid || !['admin', 'user'].includes(role)) return;
  await updateUserProfile(uid, { role });
}


