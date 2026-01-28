import React, { useState } from 'react';
import { performTrophyRoll } from '../../utils/diceLogic';
import { sendMessage } from '../../services/roomService';
import { useGame } from '../../context/GameContext';

const DiceConsole = ({ roomId }) => {
  const { user } = useGame();
  const [lightCount, setLightCount] = useState(1);
  const [darkCount, setDarkCount] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  // Reproducir sonido
  const playSound = (type) => {
    const audio = new Audio(type === 'success' ? '/assets/sounds/success.mp3' : '/assets/sounds/dice-hit.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed", e)); // Evitar errores si el navegador bloquea audio
  };

  const handleRoll = async () => {
    setIsRolling(true);
    playSound('roll');

    // 1. Calcular lógica
    const result = performTrophyRoll(lightCount, darkCount);

    // 2. Preparar el mensaje para Firebase
    const messageData = {
      type: 'roll',
      user: user.name,
      ...result
    };

    // 3. Enviar a la nube
    await sendMessage(roomId, messageData);
    
    // Si fue éxito total, sonido de victoria
    if (result.outcome === 'success') {
      setTimeout(() => playSound('success'), 500);
    }

    setIsRolling(false);
  };

  return (
    <div className="p-4 bg-black/40 border-t border-gray-800">
      {/* Controles de Cantidad */}
      <div className="flex justify-between mb-4 gap-4">
        
        {/* Dados Claros */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-trophy-text mb-1 uppercase tracking-wider">Claros</span>
          <div className="flex items-center bg-gray-900 rounded border border-gray-700">
            <button 
              onClick={() => setLightCount(Math.max(0, lightCount - 1))}
              className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-l"
            >-</button>
            <span className="px-3 font-bold text-white min-w-[30px] text-center">{lightCount}</span>
            <button 
              onClick={() => setLightCount(Math.min(6, lightCount + 1))}
              className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-r"
            >+</button>
          </div>
        </div>

        {/* Dados Oscuros */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-trophy-red mb-1 uppercase tracking-wider">Oscuros</span>
          <div className="flex items-center bg-gray-900 rounded border border-trophy-red/50">
            <button 
              onClick={() => setDarkCount(Math.max(0, darkCount - 1))}
              className="px-3 py-1 text-gray-400 hover:text-white hover:bg-red-900/30 rounded-l"
            >-</button>
            <span className="px-3 font-bold text-trophy-red min-w-[30px] text-center">{darkCount}</span>
            <button 
              onClick={() => setDarkCount(Math.min(6, darkCount + 1))}
              className="px-3 py-1 text-gray-400 hover:text-white hover:bg-red-900/30 rounded-r"
            >+</button>
          </div>
        </div>
      </div>

      {/* Botón de Lanzar */}
      <button
        onClick={handleRoll}
        disabled={isRolling || (lightCount + darkCount === 0)}
        className="w-full py-3 bg-trophy-gold hover:bg-yellow-600 text-black font-serif font-bold text-lg rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        {isRolling ? '...' : 'LANZAR'}
      </button>
    </div>
  );
};

export default DiceConsole;