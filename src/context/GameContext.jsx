import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Creamos el "Canal" de comunicación
const GameContext = createContext();

// 2. Un "Hook" personalizado para usarlo fácilmente
// Esto nos permite decir `const { user } = useGame()` en cualquier lado.
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe usarse dentro de un GameProvider');
  }
  return context;
};

// 3. El Proveedor (La antena que emite la señal)
export const GameProvider = ({ children }) => {
  // ESTADO: Aquí guardamos los datos globales
  const [user, setUser] = useState(null); // ¿Quién soy?
  const [room, setRoom] = useState(null); // ¿En qué sala estoy?
  const [gameMode, setGameMode] = useState('gold'); // 'gold' o 'dark'

  // EFECTO: Al cargar la página, miramos si ya teníamos nombre guardado en el navegador
  useEffect(() => {
    const savedName = localStorage.getItem('trophy_username');
    if (savedName) {
      setUser({ name: savedName });
    }
  }, []);

  // FUNCIÓN: Iniciar sesión (solo nombre por ahora)
  const login = (name) => {
    localStorage.setItem('trophy_username', name); // Guardar en el navegador
    setUser({ name });
  };

  // FUNCIÓN: Cerrar sesión
  const logout = () => {
    localStorage.removeItem('trophy_username');
    setUser(null);
  };

  // Empaquetamos todo lo que queremos compartir
  const value = {
    user,
    room,
    gameMode,
    setRoom,
    setGameMode,
    login,
    logout
  };

  // "children" es todo lo que pongamos dentro del proveedor (toda la App)
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};