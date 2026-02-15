import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext'; // Asegúrate de que este archivo existe
import { createRoom, joinRoom } from '../services/roomService'; 

const LandingScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, setGameMode } = useGame(); // Usamos funciones del contexto

  const [inputName, setInputName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedMode, setSelectedMode] = useState('gold'); 
  const [isLoading, setIsLoading] = useState(false);

  // --- LÓGICA DE CREAR ---
  const handleCreateGame = async () => {
    if (!inputName.trim()) return alert(t('landing.placeholder_user') + " requerido");
    
    setIsLoading(true);
    
    // 1. Guardamos el usuario en el estado global
    login(inputName);
    setGameMode(selectedMode);

    // 2. Generamos un ID aleatorio (ej: "x7k2p9")
    const newRoomId = Math.random().toString(36).substring(2, 8); 
    
    // 3. Creamos la sala en Firebase
    const result = await createRoom(newRoomId, inputName, selectedMode);
    
    if (result.success) {
      // 4. CORRECCIÓN IMPORTANTE: Navegamos a /room/, no /game/
      navigate(`/room/${newRoomId}`);
    } else {
      alert("Error: " + result.error);
    }
    setIsLoading(false);
  };

  // --- LÓGICA DE UNIRSE ---
  const handleJoinGame = async () => {
    if (!inputName.trim() || !roomId.trim()) return alert("Nombre y Sala obligatorios");
    
    setIsLoading(true);
    login(inputName);

    // Intentamos unirnos en Firebase primero para ver si existe
    const result = await joinRoom(roomId, inputName);

    if (result.success) {
      navigate(`/room/${roomId}`);
    } else {
      alert("No se pudo entrar: " + result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-trophy-dark text-trophy-text p-4 font-sans">
      
      {/* TÍTULO */}
      <h1 className="text-5xl md:text-7xl font-serif text-trophy-gold mb-2 text-center drop-shadow-md tracking-tighter">
        {t('app_title')} 
      </h1>
      
      {/* CAJA PRINCIPAL */}
      <div className="bg-trophy-panel p-8 rounded-xl shadow-2xl border border-stone-800 w-full max-w-md relative mt-10">
        
        {/* Decoración dorada superior */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-trophy-gold to-transparent opacity-50"></div>

        {/* INPUT NOMBRE */}
        <div className="mb-6">
          <label className="block text-xs font-bold mb-2 text-trophy-gold uppercase tracking-widest">
            Tu Nombre
          </label>
          <input
            type="text"
            className="w-full bg-black/40 border border-stone-700 rounded p-3 text-white focus:border-trophy-gold focus:outline-none transition-all"
            placeholder="Ej: Akaleh, Baso..."
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
        </div>

        {/* SELECTOR DE MODO */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedMode('gold')}
            className={`p-4 rounded border transition-all flex flex-col items-center ${
              selectedMode === 'gold' 
                ? 'bg-trophy-gold/10 border-trophy-gold text-trophy-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                : 'bg-black/20 border-stone-700 text-stone-500 hover:border-stone-500'
            }`}
          >
            <span className="font-serif font-bold text-xl">GOLD</span>
            <span className="text-[10px] uppercase tracking-wide opacity-80">Aventura</span>
          </button>
          
          <button
            onClick={() => setSelectedMode('dark')}
            className={`p-4 rounded border transition-all flex flex-col items-center ${
              selectedMode === 'dark' 
                ? 'bg-trophy-red/20 border-trophy-red text-trophy-red shadow-[0_0_15px_rgba(127,29,29,0.4)]' 
                : 'bg-black/20 border-stone-700 text-stone-500 hover:border-stone-500'
            }`}
          >
            <span className="font-serif font-bold text-xl">DARK</span>
            <span className="text-[10px] uppercase tracking-wide opacity-80">Horror</span>
          </button>
        </div>

        {/* BOTÓN CREAR */}
        <button 
          onClick={handleCreateGame}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-stone-700 to-stone-600 hover:from-trophy-gold hover:to-amber-600 hover:text-black text-white font-serif font-bold text-lg rounded shadow-lg transition-all mb-8 border border-stone-600 hover:border-trophy-gold"
        >
          {isLoading ? 'Abriendo portón...' : t('menu.create_room')}
        </button>

        {/* SECCIÓN UNIRSE */}
        <div className="border-t border-stone-700 pt-6">
          <p className="text-xs text-center text-stone-500 mb-3 uppercase tracking-wider">
            {t('menu.join_room')}
          </p>
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Código..."
              className="flex-1 bg-black/40 border border-stone-700 rounded p-3 text-sm focus:border-trophy-gold focus:outline-none text-center tracking-widest uppercase"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button 
              onClick={handleJoinGame}
              disabled={isLoading}
              className="px-6 py-3 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-300 font-bold rounded transition-colors text-sm uppercase"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer decorativo */}
      <div className="mt-8 text-stone-600 text-xs font-serif italic">
        "El bosque exige un sacrificio..."
      </div>
    </div>
  );
};

export default LandingScreen;