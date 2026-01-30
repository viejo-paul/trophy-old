import React, { useState } from 'react';
import { User, Skull } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { joinRoom, updateCharacter } from '../services/roomService';

const LobbyScreen = ({ roomId, roomData }) => {
  const { login } = useGame();
  const [charName, setCharName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!charName.trim()) return;

    setIsLoading(true);

    try {
      // 1. Guardamos quién eres en la App
      login(charName);

      // 2. Te apuntamos en la lista de la sala (Array 'players')
      await joinRoom(roomId, charName);

      // 3. Creamos tu ficha básica (stats por defecto de Trophy Gold)
      await updateCharacter(roomId, charName, {
        name: charName,
        occupation: '',
        drive: '',
        hp: 6,
        maxHp: 6,
        gold: 0,
        equipment: []
      });
      
      // Al terminar, GameScreen detectará que ya estás en la lista y te dejará pasar automáticamente.
    } catch (error) {
      console.error("Error al unirse:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-amber-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900 via-slate-900 to-black"></div>

      <div className="z-10 w-full max-w-lg bg-slate-800/80 backdrop-blur-sm border border-slate-600 p-8 rounded-lg shadow-2xl">
        
        {/* Cabecera de la Aventura */}
        <div className="text-center mb-10">
          <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Preparando incursión</h2>
          <h1 className="text-3xl md:text-4xl font-bold text-amber-500 drop-shadow-md font-serif">
            {roomData?.title || 'Incursión sin nombre'}
          </h1>
          <div className="mt-4 flex justify-center items-center gap-2 text-slate-300 text-sm">
            <span className="px-2 py-0.5 rounded border border-amber-600 text-amber-500 bg-amber-900/20">
               {/* Si no hay gameMode, asumimos Gold */}
               {roomData?.gameMode === 'dark' ? 'TROPHY DARK' : 'TROPHY GOLD'}
            </span>
          </div>
        </div>

        {/* Zona de Acción (Simulada por ahora) */}
        <div className="space-y-6">
          
          <form className="space-y-4" onSubmit={handleJoin}>
            <div className="text-center">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                ¿Quién osa entrar en el bosque?
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded pl-10 p-3 text-amber-50 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Nombre de tu buscador de tesoros"
                  autoFocus
                />
              </div>
            </div>

            <button
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-all"
            >
              <Skull size={18} />
              ENTRAR A LA PARTIDA (Demo)
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;