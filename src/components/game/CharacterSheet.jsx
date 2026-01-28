import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { updateCharacter, subscribeToCharacter } from '../../services/roomService';

const CharacterSheet = ({ roomId, gameMode }) => {
  const { user } = useGame();
  
  // ESTADO LOCAL: Aquí guardamos los datos mientras escribes
  const [charData, setCharData] = useState({
    name: user.name,
    occupation: '',
    background: '',
    ruin: 1,
    gold: 0, // Solo Gold
    burden: '', // Solo Gold (Carga)
    drive: '', // Solo Dark (Impulso)
    rituals: '',
    inventory: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // 1. ESCUCHAR DATOS DE LA NUBE (Al cargar)
  useEffect(() => {
    const unsubscribe = subscribeToCharacter(roomId, user.name, (data) => {
      // Solo actualizamos si hay datos remotos, mezclándolos con los valores por defecto
      if (data && Object.keys(data).length > 0) {
        setCharData(prev => ({ ...prev, ...data }));
      }
    });
    return () => unsubscribe();
  }, [roomId, user.name]);

  // 2. FUNCIÓN DE AUTO-GUARDADO (Se llama cada vez que cambias un campo)
  const handleChange = (field, value) => {
    const newData = { ...charData, [field]: value };
    setCharData(newData);
    
    // Guardamos en Firebase (La magia del tiempo real)
    // Nota: En una app pro usaríamos "debounce" para no machacar el servidor,
    // pero para empezar esto es perfecto y rápido.
    setIsSaving(true);
    updateCharacter(roomId, user.name, newData).then(() => {
      setTimeout(() => setIsSaving(false), 500); // Pequeño delay visual
    });
  };

  return (
    <div className="h-full flex flex-col bg-trophy-panel text-trophy-text">
      
      {/* CABECERA */}
      <div className="p-4 border-b border-gray-700 bg-black/20 flex justify-between items-center">
        <h2 className="text-xl font-serif text-trophy-gold">{user.name}</h2>
        {isSaving && <span className="text-xs text-gray-500 animate-pulse">Guardando...</span>}
      </div>

      {/* CUERPO CON SCROLL */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

        {/* SECCIÓN 1: IDENTIDAD */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Ocupación</label>
            <input 
              type="text" 
              className="w-full bg-black/30 border border-gray-700 rounded p-2 focus:border-trophy-gold outline-none transition-colors"
              value={charData.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              placeholder="Ej. Cazador de Ratas"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Trasfondo / Habilidad</label>
            <textarea 
              className="w-full bg-black/30 border border-gray-700 rounded p-2 focus:border-trophy-gold outline-none transition-colors h-20 resize-none"
              value={charData.background}
              onChange={(e) => handleChange('background', e.target.value)}
              placeholder="¿En qué eres experto?"
            />
          </div>
        </div>

        {/* SECCIÓN 2: ESTADÍSTICAS (Varía según Modo) */}
        <div className="bg-black/40 p-4 rounded border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-trophy-red uppercase">Ruina</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => handleChange('ruin', num)}
                  className={`w-8 h-8 rounded border flex items-center justify-center font-serif font-bold transition-all ${
                    charData.ruin >= num 
                      ? 'bg-trophy-red text-white border-trophy-red' 
                      : 'bg-transparent text-gray-700 border-gray-800 hover:border-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {gameMode === 'gold' ? (
            // MODO GOLD: ORO
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-trophy-gold uppercase">Oro</label>
              <input 
                type="number" 
                className="w-20 bg-black/50 border border-trophy-gold/50 rounded p-1 text-center font-serif text-lg text-trophy-gold focus:outline-none"
                value={charData.gold}
                onChange={(e) => handleChange('gold', parseInt(e.target.value) || 0)}
              />
            </div>
          ) : (
            // MODO DARK: IMPULSO
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Impulso (Drive)</label>
              <input 
                type="text" 
                className="w-full bg-black/30 border border-gray-700 rounded p-2 focus:border-trophy-red outline-none"
                value={charData.drive}
                onChange={(e) => handleChange('drive', e.target.value)}
                placeholder="¿Qué te empuja a la oscuridad?"
              />
            </div>
          )}
        </div>

        {/* SECCIÓN 3: INVENTARIO Y RITUALES */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Rituales</label>
            <textarea 
              className="w-full bg-black/30 border border-gray-700 rounded p-2 focus:border-trophy-gold outline-none h-24"
              value={charData.rituals}
              onChange={(e) => handleChange('rituals', e.target.value)}
              placeholder="Lista de rituales conocidos..."
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Equipo e Inventario</label>
            <textarea 
              className="w-full bg-black/30 border border-gray-700 rounded p-2 focus:border-trophy-gold outline-none h-32"
              value={charData.inventory}
              onChange={(e) => handleChange('inventory', e.target.value)}
              placeholder="Antorchas, comida, armas..."
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CharacterSheet;