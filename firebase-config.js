// Configuration Firebase
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
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

let app = null;
let db = null;
let auth = null;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('✅ Firebase initialisé avec succès');
} catch (error) {
    console.error('❌ Erreur Firebase:', error);
}

export { db, auth, firebaseConfig };
