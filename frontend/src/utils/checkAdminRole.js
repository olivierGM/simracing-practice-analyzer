/**
 * Utilitaire pour vérifier et mettre à jour le rôle admin de cow.killa@gmail.com
 * 
 * À exécuter une fois pour s'assurer que le compte admin a le bon rôle dans Firestore.
 * Usage: Appeler cette fonction depuis la console du navigateur ou depuis AdminPage.
 */

import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Vérifie et met à jour le rôle admin pour cow.killa@gmail.com
 * @returns {Promise<{found: boolean, updated: boolean, uid: string|null}>}
 */
export async function ensureAdminRole() {
  try {
    // Chercher l'utilisateur par email dans Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'cow.killa@gmail.com'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('⚠️ Aucun utilisateur trouvé avec cow.killa@gmail.com');
      return { found: false, updated: false, uid: null };
    }

    // Prendre le premier résultat (normalement il n'y en a qu'un)
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;

    console.log(`✅ Utilisateur trouvé: ${uid}`, userData);

    // Vérifier si le rôle est déjà 'admin'
    if (userData.role === 'admin') {
      console.log('✅ Le rôle est déjà "admin"');
      return { found: true, updated: false, uid };
    }

    // Mettre à jour le rôle à 'admin'
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: serverTimestamp()
    });

    console.log('✅ Rôle mis à jour à "admin"');
    return { found: true, updated: true, uid };
  } catch (error) {
    console.error('❌ Erreur lors de la vérification/mise à jour:', error);
    throw error;
  }
}

/**
 * Vérifie le rôle de l'utilisateur actuellement connecté
 * @returns {Promise<{email: string, role: string|null}>}
 */
export async function checkCurrentUserRole() {
  const user = auth.currentUser;
  if (!user) {
    console.log('⚠️ Aucun utilisateur connecté');
    return { email: null, role: null };
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log(`📧 Email: ${data.email || user.email}`);
      console.log(`👤 Rôle: ${data.role || 'non défini (sera "user" par défaut)'}`);
      return { email: data.email || user.email, role: data.role || null };
    } else {
      console.log('⚠️ Profil utilisateur non trouvé dans Firestore');
      return { email: user.email, role: null };
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
}
