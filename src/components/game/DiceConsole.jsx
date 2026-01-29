import React, { useState } from 'react';
import { performTrophyRoll } from '../../utils/diceLogic';
import { sendMessage } from '../../services/roomService';
import { useGame } from '../../context/GameContext';
import { Sword, Compass, Skull, AlertTriangle, Users } from 'lucide-react';

const DiceConsole = ({ roomId }) => {
  const { user } = useGame();
  
  // ESTADOS
  const [rollType, setRollType] = useState('risk');
  const [lightCount, setLightCount] = useState(1);
  const [darkCount, setDarkCount] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  // Estados exclusivos de Combate
  const [combatants, setCombatants] = useState(1);
  const [enemyEndurance, setEnemyEndurance] = useState(10);

  // Sonidos
  const playSound = (type) => {
    const audio = new Audio(type === 'success' ? '/assets/sounds/success.mp3' : '/assets/sounds/dice-hit.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed", e));
  };

  const handleRoll = async () => {
    setIsRolling(true);
    playSound('roll');

    // Preparamos parámetros
    const combatParams = {
      enemyEndurance: parseInt(enemyEndurance),
      combatants: parseInt(combatants)
    };

    // Si es combate: 1 dado claro (mío) y 'combatants' dados oscuros (grupo)
    const result = performTrophyRoll(rollType, lightCount, darkCount, combatParams);

    const messageData = {
      user: user.name,
      ...result 
    };

    await sendMessage(roomId, messageData);
    
    // En combate, éxito es victoria total. En riesgo, es un 6.
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
      
      {/* 1. PESTAÑAS */}
      <div className="flex border-b border-gray-800">
        <TabButton type="risk" icon={AlertTriangle} label="Riesgo" color="trophy-gold" />
        <TabButton type="combat" icon={Sword} label="Combate" color="red-500" />
        <TabButton type="hunt" icon={Compass} label="Exploración" color="green-500" />
        <TabButton type="ruin" icon={Skull} label="Ruina" color="gray-400" />
      </div>

      {/* 2. CONTROLES */}
      <div className="p-4 space-y-4">
        
        {/* --- MODO COMBATE --- */}
        {rollType === 'combat' ? (
          <div className="space-y-3">
             <div className="flex gap-4">
                {/* Número de Combatientes */}
                <div className="flex-1">
                   <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1 mb-1">
                     <Users size={12}/> Combatientes
                   </label>
                   <div className="flex items-center w-full bg-gray-900 rounded border border-gray-700">
                      <button onClick={() => setCombatants(Math.max(1, combatants - 1))} className="p-2 text-gray-400 hover:text-white">-</button>
                      <span className="flex-1 text-center font-bold text-white">{combatants}</span>
                      <button onClick={() => setCombatants(Math.min(10, combatants + 1))} className="p-2 text-gray-400 hover:text-white">+</button>
                   </div>
                </div>

                {/* Aguante Enemigo */}
                <div className="flex-1">
                   <label className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1 mb-1">
                     <Sword size={12}/> Aguante
                   </label>
                   <div className="flex items-center w-full bg-red-900/20 rounded border border-red-900/50">
                      <button onClick={() => setEnemyEndurance(Math.max(1, enemyEndurance - 1))} className="p-2 text-red-400 hover:text-white">-</button>
                      <span className="flex-1 text-center font-bold text-red-100">{enemyEndurance}</span>
                      <button onClick={() => setEnemyEndurance(Math.min(50, enemyEndurance + 1))} className="p-2 text-red-400 hover:text-white">+</button>
                   </div>
                </div>
             </div>
             <p className="text-[10px] text-gray-500 italic text-center">
               Se tirará 1 dado claro (tu punto débil) y {combatants} oscuros (ataque grupal).
             </p>
          </div>

        ) : rollType === 'ruin' ? (
          /* --- MODO RUINA --- */
          <div className="text-center text-gray-400 text-xs">
            <p className="mb-2">Tira 1 dado oscuro.</p>
            <p>Si sacas MÁS que tu Ruina actual, te salvas.</p>
          </div>
        ) : (
          /* --- MODO RIESGO / EXPLORACIÓN --- */
          <div className="flex justify-between gap-4">
            <div className="flex flex-col items-center w-1/2">
              <span className="text-xs text-trophy-text mb-1 uppercase tracking-wider">Claros</span>
              <div className="flex items-center w-full bg-gray-900 rounded border border-gray-700">
                <button onClick={() => setLightCount(Math.max(0, lightCount - 1))} className="p-2 text-gray-400 hover:text-white">-</button>
                <span className="flex-1 text-center font-bold text-white">{lightCount}</span>
                <button onClick={() => setLightCount(Math.min(6, lightCount + 1))} className="p-2 text-gray-400 hover:text-white">+</button>
              </div>
            </div>

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

        {/* 3. BOTÓN DE LANZAR */}
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className={`w-full py-3 font-serif font-bold text-lg rounded shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            rollType === 'combat' ? 'bg-trophy-red text-white hover:bg-red-800' :
            rollType === 'hunt' ? 'bg-green-700 text-white hover:bg-green-600' :
            rollType === 'ruin' ? 'bg-gray-700 text-white hover:bg-gray-600' :
            'bg-trophy-gold text-black hover:bg-yellow-600'
          }`}
        >
          {isRolling ? '...' : 
           rollType === 'combat' ? 'ATAQUE GRUPAL' : 
           rollType === 'hunt' ? 'EXPLORAR' : 
           rollType === 'ruin' ? 'RESISTIR RUINA' : 'ARRIESGAR'}
        </button>

      </div>
    </div>
  );
};

export default DiceConsole;