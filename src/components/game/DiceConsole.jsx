import React, { useState } from 'react';
import { performTrophyRoll } from '../../utils/diceLogic';
import { sendMessage } from '../../services/roomService';
import { useGame } from '../../context/GameContext';
import { Sword, Compass, Skull, AlertTriangle } from 'lucide-react'; // Cambié Footprints por Compass

const DiceConsole = ({ roomId }) => {
  const { user } = useGame();
  
  // ESTADOS
  const [rollType, setRollType] = useState('risk'); // 'risk', 'combat', 'hunt', 'ruin'
  const [lightCount, setLightCount] = useState(1);
  const [darkCount, setDarkCount] = useState(0);
  const [targetNumber, setTargetNumber] = useState(6);
  const [isRolling, setIsRolling] = useState(false);

  // Sonidos
  const playSound = (type) => {
    const audio = new Audio(type === 'success' ? '/assets/sounds/success.mp3' : '/assets/sounds/dice-hit.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed", e));
  };

  const handleRoll = async () => {
    setIsRolling(true);
    playSound('roll');

    const result = performTrophyRoll(rollType, lightCount, darkCount, targetNumber);

    const messageData = {
      // OJO: Aquí enviamos 'rollType' separado para no machacar el tipo principal si quisieramos
      // Pero para mantener compatibilidad con lo que hicimos antes, dejamos que result sobreescriba.
      user: user.name,
      ...result 
    };

    await sendMessage(roomId, messageData);
    
    if (result.outcome === 'success') {
      setTimeout(() => playSound('success'), 500);
    }

    setIsRolling(false);
  };

  const TabButton = ({ type, icon: Icon, label, color }) => (
    <button
      onClick={() => setRollType(type)}
      className={`flex-1 flex flex-col items-center justify-center py-2 transition-all ${
        rollType === type 
          ? `bg-gray-800 text-${color} border-t-2 border-${color}` 
          : 'bg-black/40 text-gray-500 hover:text-gray-300'
      }`}
    >
      <Icon size={16} />
      <span className="text-[10px] font-bold uppercase mt-1">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col bg-trophy-panel border-t border-gray-800">
      
      {/* 1. SELECTOR DE TIPO (PESTAÑAS) */}
      <div className="flex border-b border-gray-800">
        <TabButton type="risk" icon={AlertTriangle} label="Riesgo" color="trophy-gold" />
        <TabButton type="combat" icon={Sword} label="Combate" color="red-500" />
        <TabButton type="hunt" icon={Compass} label="Exploración" color="green-500" />
        <TabButton type="ruin" icon={Skull} label="Ruina" color="gray-400" />
      </div>

      {/* 2. CONTROLES */}
      <div className="p-4 space-y-4">
        
        {rollType === 'ruin' ? (
          <div className="text-center text-gray-400 text-xs">
            <p className="mb-2">Tira 1 dado oscuro.</p>
            <p>Si sacas MÁS que tu Ruina actual, te salvas.</p>
          </div>
        ) : (
          <div className="flex justify-between gap-4">
            {/* Dados Claros */}
            <div className="flex flex-col items-center w-1/2">
              <span className="text-xs text-trophy-text mb-1 uppercase tracking-wider">Claros</span>
              <div className="flex items-center w-full bg-gray-900 rounded border border-gray-700">
                <button onClick={() => setLightCount(Math.max(0, lightCount - 1))} className="p-2 text-gray-400 hover:text-white">-</button>
                <span className="flex-1 text-center font-bold text-white">{lightCount}</span>
                <button onClick={() => setLightCount(Math.min(6, lightCount + 1))} className="p-2 text-gray-400 hover:text-white">+</button>
              </div>
            </div>

            {/* Dados Oscuros */}
            <div className="flex flex-col items-center w-1/2">
              <span className="text-xs text-trophy-red mb-1 uppercase tracking-wider">Oscuros</span>
              <div className="flex items-center w-full bg-gray-900 rounded border border-trophy-red/50">
                <button onClick={() => setDarkCount(Math.max(0, darkCount - 1))} className="p-2 text-gray-400 hover:text-white">-</button>
                <span className="flex-1 text-center font-bold text-trophy-red">{darkCount}</span>
                <button onClick={() => setDarkCount(Math.min(6, darkCount + 1))} className="p-2 text-gray-400 hover:text-white">+</button>
              </div>
            </div>
          </div>
        )}

        {/* INPUT COMBATE */}
        {rollType === 'combat' && (
          <div className="flex items-center justify-between bg-red-900/20 p-2 rounded border border-red-900/50">
            <span className="text-xs text-red-400 uppercase font-bold">Aguante del Enemigo:</span>
            <input 
              type="number" 
              value={targetNumber}
              onChange={(e) => setTargetNumber(parseInt(e.target.value) || 6)}
              className="w-12 bg-black border border-red-900 rounded text-center text-white font-bold"
            />
          </div>
        )}

        {/* 3. BOTÓN DE LANZAR */}
        <button
          onClick={handleRoll}
          disabled={isRolling || (rollType !== 'ruin' && lightCount + darkCount === 0)}
          className={`w-full py-3 font-serif font-bold text-lg rounded shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            rollType === 'combat' ? 'bg-trophy-red text-white hover:bg-red-800' :
            rollType === 'hunt' ? 'bg-green-700 text-white hover:bg-green-600' :
            rollType === 'ruin' ? 'bg-gray-700 text-white hover:bg-gray-600' :
            'bg-trophy-gold text-black hover:bg-yellow-600'
          }`}
        >
          {isRolling ? '...' : 
           rollType === 'combat' ? 'ATACAR' : 
           rollType === 'hunt' ? 'EXPLORAR' : 
           rollType === 'ruin' ? 'RESISTIR RUINA' : 'ARRIESGAR'}
        </button>

      </div>
    </div>
  );
};

export default DiceConsole;
