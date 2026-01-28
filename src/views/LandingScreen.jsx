import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { createRoom } from '../services/roomService'; // <--- Importamos el servicio

const LandingScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, login, setGameMode } = useGame();

  const [inputName, setInputName] = useState(user?.name || '');
  const [roomId, setRoomId] = useState('');
  const [selectedMode, setSelectedMode] = useState('gold'); // Por defecto Gold
  const [isLoading, setIsLoading] = useState(false);

  // CREAR PARTIDA
  const handleCreateGame = async () => {
    if (!inputName.trim()) return alert("¡Necesitas un nombre para entrar!");
    
    setIsLoading(true);
    login(inputName); // Guardar usuario localmente
    setGameMode(selectedMode); // Guardar modo en contexto

    // Generar ID y crear en DB
    const newRoomId = Math.random().toString(36).substring(2, 9); // ID más limpio
    
    // Llamamos a nuestro "Camarero"
    const result = await createRoom(newRoomId, inputName, selectedMode);
    
    if (result.success) {
      navigate(`/game/${newRoomId}`);
    } else {
      alert("Hubo un error al crear la sala. Revisa tu conexión.");
    }
    setIsLoading(false);
  };

  // UNIRSE A PARTIDA
  const handleJoinGame = () => {
    if (!inputName.trim() || !roomId.trim()) return alert("Nombre y Sala obligatorios");
    login(inputName);
    navigate(`/game/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-trophy-dark text-trophy-text p-4 font-sans">
      <h1 className="text-5xl md:text-7xl font-serif text-trophy-gold mb-2 text-center drop-shadow-md">
        {t('app.title')}
      </h1>
      <p className="text-lg text-trophy-sub mb-10 italic opacity-80">
        {t('app.subtitle')}
      </p>

      <div className="bg-trophy-panel p-8 rounded-xl shadow-2xl border border-gray-800 w-full max-w-md relative overflow-hidden">
        {/* Decoración de fondo sutil */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-trophy-gold to-transparent opacity-50"></div>

        {/* NOMBRE USUARIO */}
        <div className="mb-6">
          <label className="block text-xs font-bold mb-2 text-trophy-gold uppercase tracking-widest">
            {t('landing.placeholder_user')}
          </label>
          <input
            type="text"
            className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-trophy-gold focus:outline-none transition-all"
            placeholder="Nombre de tu aventurero..."
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
        </div>

        {/* SELECTOR DE MODO (Solo visible al crear) */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedMode('gold')}
            className={`p-3 rounded border transition-all ${
              selectedMode === 'gold' 
                ? 'bg-trophy-gold/20 border-trophy-gold text-trophy-gold' 
                : 'bg-black/30 border-gray-700 text-gray-500 hover:border-gray-500'
            }`}
          >
            <span className="block font-serif font-bold text-lg">GOLD</span>
            <span className="text-xs">Aventura y Tesoro</span>
          </button>
          <button
            onClick={() => setSelectedMode('dark')}
            className={`p-3 rounded border transition-all ${
              selectedMode === 'dark' 
                ? 'bg-trophy-red/20 border-trophy-red text-trophy-red' 
                : 'bg-black/30 border-gray-700 text-gray-500 hover:border-gray-500'
            }`}
          >
            <span className="block font-serif font-bold text-lg">DARK</span>
            <span className="text-xs">Horror y Ruina</span>
          </button>
        </div>

        {/* BOTÓN CREAR */}
        <button 
          onClick={handleCreateGame}
          disabled={isLoading}
          className="w-full py-4 bg-trophy-red hover:bg-red-800 disabled:opacity-50 text-white font-serif font-bold text-xl rounded shadow-lg transition-all mb-6 flex justify-center items-center gap-2"
        >
          {isLoading ? 'Creando...' : t('landing.new_game')}
        </button>

        {/* SECCIÓN UNIRSE */}
        <div className="border-t border-gray-700 pt-6">
          <p className="text-xs text-center text-gray-500 mb-3 uppercase tracking-wider">O únete a una existente</p>
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Código de Sala"
              className="flex-1 bg-black/50 border border-gray-700 rounded p-3 text-sm focus:border-trophy-gold focus:outline-none"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button 
              onClick={handleJoinGame}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingScreen;