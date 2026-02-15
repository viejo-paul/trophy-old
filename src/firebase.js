import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // Lo usaremos más adelante

// Vite carga las variables de entorno automáticamente si empiezan por VITE_
const firebaseConfig = {
  apiKey: "AIzaSyC-7qaYG-fB-xkaVS5_4g8x9Whpu84TSow",
  authDomain: "trophy-gold-v2.firebaseapp.com",
  projectId: "trophy-gold-v2",
  storageBucket: "trophy-gold-v2.firebasestorage.app",
  messagingSenderId: "369283032350",
  appId: "1:369283032350:web:2d06f470a162a3e9f3150f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar la Base de Datos
export const db = getFirestore(app);

// export const auth = getAuth(app); // Preparado para el futuro