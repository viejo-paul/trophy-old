import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

// ------------------------------------------------------------------
// GESTIÓN DE SALAS (CORE)
// ------------------------------------------------------------------

// CREAR UNA SALA NUEVA
export const createRoom = async (roomId, hostName, gameMode) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      return { success: false, error: "La sala ya existe" };
    }

    const newRoomData = {
      id: roomId,
      createdAt: new Date(),
      host: hostName,
      gameMode: gameMode, 
      players: [hostName],
      currentScene: '', 
      notes: '' 
    };

    await setDoc(roomRef, newRoomData);
    return { success: true };
  } catch (error) {
    console.error("Error creando sala:", error);
    return { success: false, error };
  }
};

// UNIRSE A UNA SALA EXISTENTE
export const joinRoom = async (roomId, playerName) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      return { success: false, error: "Sala no encontrada" };
    }

    await updateDoc(roomRef, {
      players: arrayUnion(playerName)
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error uniéndose a la sala:", error);
    return { success: false, error };
  }
};

// ESCUCHAR CAMBIOS EN LA SALA
export const subscribeToRoom = (roomId, callback) => {
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null); 
    }
  });
};

// ------------------------------------------------------------------
// PARCHE DE COMPATIBILIDAD "BLINDADO" (Stubs)
// ------------------------------------------------------------------
// Estas funciones existen solo para que los componentes viejos no fallen.
// Las implementaremos de verdad cuando lleguemos a sus fases.

export const updateCharacter = async () => { console.warn("updateCharacter pendiente"); };
export const updateRoom = async () => { console.warn("updateRoom pendiente"); };
export const subscribeToCharacter = () => { return () => {}; };

// CHAT Y MENSAJES (Lo que causaba tu error)
export const sendMessage = async (roomId, msg) => { 
  console.log("Simulando envío de mensaje:", msg); 
};

export const subscribeToMessages = (roomId, callback) => {
  console.warn("Chat desactivado temporalmente.");
  // Devolvemos unsubscribe vacío
  return () => {}; 
};

// EXTRAS (Por si acaso GameScreen los pide)
export const rollDice = async () => { console.warn("rollDice pendiente"); };
export const updateNote = async () => { console.warn("updateNote pendiente"); };
export const deleteRoom = async () => { console.warn("deleteRoom pendiente"); };