import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  collection,      // <--- Estas son las que probablemente faltaban
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  limit 
} from 'firebase/firestore';

// ------------------------------------------------------------------
// GESTIÓN DE SALAS (ROOMS)
// ------------------------------------------------------------------

// CREAR UNA SALA NUEVA
export const createRoom = async (roomId, hostName, gameMode) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      return { success: true, isNew: false };
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
    return { success: true, isNew: true };
  } catch (error) {
    console.error("Error creando sala:", error);
    return { success: false, error };
  }
};

// UNIRSE A UNA SALA EXISTENTE
export const joinRoom = async (roomId, playerName) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      players: arrayUnion(playerName)
    });
  } catch (error) {
    console.error("Error uniéndose a la sala:", error);
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
// GESTIÓN DEL CHAT Y DADOS (MESSAGES)
// ------------------------------------------------------------------

// ENVIAR UN MENSAJE (Texto o Tirada)
export const sendMessage = async (roomId, messageData) => {
  try {
    // Referencia a la subcolección 'messages' dentro de la sala
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    await addDoc(messagesRef, {
      ...messageData,
      timestamp: serverTimestamp() 
    });
  } catch (error) {
    console.error("Error enviando mensaje:", error);
  }
};

// ESCUCHAR EL CHAT EN VIVO
export const subscribeToMessages = (roomId, callback) => {
  const messagesRef = collection(db, 'rooms', roomId, 'messages');
  // Ordenamos por fecha para que salgan en orden
  const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

// ------------------------------------------------------------------
// GESTIÓN DE PERSONAJES (CHARACTERS)
// ------------------------------------------------------------------

// GUARDAR/ACTUALIZAR FICHA
export const updateCharacter = async (roomId, characterName, characterData) => {
  try {
    // Guardamos la ficha en: rooms -> ID_SALA -> characters -> NOMBRE_PJ
    const charRef = doc(db, 'rooms', roomId, 'characters', characterName);
    
    // setDoc con {merge: true} actualiza solo los campos que cambiamos, no borra el resto
    await setDoc(charRef, characterData, { merge: true });
  } catch (error) {
    console.error("Error guardando personaje:", error);
  }
};

// ESCUCHAR MI FICHA EN VIVO
export const subscribeToCharacter = (roomId, characterName, callback) => {
  const charRef = doc(db, 'rooms', roomId, 'characters', characterName);
  return onSnapshot(charRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      // Si no existe, devolvemos un objeto vacío para que el formulario no falle
      callback({}); 
    }
  });
};

// ACTUALIZAR DATOS DE LA SALA (Para el GM)
export const updateRoom = async (roomId, data) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    // updateDoc solo cambia lo que le enviemos, no borra el resto
    await updateDoc(roomRef, data);
  } catch (error) {
    console.error("Error actualizando sala:", error);
  }
};