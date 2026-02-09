/**
 * Hook pour récupérer le rôle de l'utilisateur depuis Firestore
 *
 * Retourne { role: 'admin' | 'user' | null, loading, isAdmin }
 *
 * Rétrocompatibilité : si le profil n'a pas de champ role mais que l'email est
 * l'admin connu (cow.killa@gmail.com), on traite comme admin et on persiste le rôle en Firestore.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/firebase';

const ADMIN_EMAIL = 'cow.killa@gmail.com';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setRole(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    getUserProfile(user.uid)
      .then((profile) => {
        if (cancelled) return;
        let userRole = profile?.role;
        // Rétrocompatibilité : profil sans rôle mais email admin → admin et on persiste
        if (userRole === undefined || userRole === null) {
          if (user.email === ADMIN_EMAIL) {
            userRole = 'admin';
            setRole(userRole);
            setLoading(false);
            updateUserProfile(user.uid, { role: 'admin' }).catch((err) =>
              console.warn('Could not persist admin role:', err)
            );
            return;
          }
          userRole = 'user';
        }
        setRole(userRole);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Error fetching user role:', err);
        // Fallback : si l'email est admin, afficher le cog quand même
        const userRole = user.email === ADMIN_EMAIL ? 'admin' : 'user';
        setRole(userRole);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.email]);

  return {
    role,
    loading,
    isAdmin: role === 'admin'
  };
}
