import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { updateCharacter, subscribeToCharacter } from '../../services/roomService';
import { User, Shield, Skull, Scroll, HeartPulse, Backpack } from 'lucide-react';

const CharacterSheet = ({ roomId, gameMode }) => {
  const { user } = useGame();
  
  // ESTADO LOCAL
  const [charData, setCharData] = useState({
    name: user.name,
    avatar: '',          // NUEVO: URL de la imagen
    occupation: '',
    background: '',
    ruin: 1,
    gold: 0,
    burden: 0,           // Solo Gold
    drive: '',           // Solo Dark
    conditions: '',      // NUEVO: Para anotar estados/cicatrices
    rituals: '',
    inventory: '',       // Texto simple (Dark)
    equipmentSlots: ['', '', '', '', '', ''] // NUEVO: 6 huecos para Gold
  });

  const [isSaving, setIsSaving] = useState(false);

  // 1. ESCUCHAR DATOS
  useEffect(() => {
    const unsubscribe = subscribeToCharacter(roomId, user.name, (data) => {
      if (data && Object.keys(data).length > 0) {
        // Fusionamos con cuidado para no perder los slots si vienen vacíos de la DB antigua
        setCharData(prev => ({ 
          ...prev, 
          ...data,
          // Aseguramos que siempre haya 6 slots en modo Gold si no existen
          equipmentSlots: data.equipmentSlots || ['', '', '', '', '', ''] 
        }));
      }
    });
    return () => unsubscribe();
  }, [roomId, user.name]);

  // 2. AUTO-GUARDADO
  const handleChange = (field, value) => {
    const newData = { ...charData, [field]: value };
    setCharData(newData);
    
    setIsSaving(true);
    updateCharacter(roomId, user.name, newData).then(() => {
      setTimeout(() => setIsSaving(false), 500);
    });
  };

  // Manejar cambios en los slots de equipo (Array)
  const handleSlotChange = (index, value) => {
    const newSlots = [...charData.equipmentSlots];
    newSlots[index] = value;
    handleChange('equipmentSlots', newSlots);
  };

  // Truco rápido para cambiar Avatar (Prompt nativo)
  const handleAvatarClick = () => {
    const url = window.prompt("Pega la URL de tu imagen de personaje:", charData.avatar);
    if (url !== null) handleChange('avatar', url);
  };

  return (
    <div className="h-full flex flex-col bg-trophy-panel text-trophy-text">
      
      {/* --- CABECERA (AVATAR + NOMBRE) --- */}
      <div className="p-4 border-b border-gray-700 bg-black/20 flex gap-4 items-center">
        {/* Avatar Circular */}
        <div 
          onClick={handleAvatarClick}
          className="relative w-16 h-16 rounded-full border-2 border-trophy-gold overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-black flex-shrink-0"
          title="Clic para cambiar imagen"
        >
          {charData.avatar ? (
            <img src={charData.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <User size={32} />
            </div>
          )}
        </div>

        {/* Datos Básicos */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-serif text-trophy-gold truncate">{charData.name}</h2>
          <input 
            type="text" 
            className="w-full bg-transparent border-none text-sm text-gray-400 placeholder-gray-600 focus:text-white focus:outline-none p-0"
            value={charData.occupation}
            onChange={(e) => handleChange('occupation', e.target.value)}
            placeholder="Ocupación..."
          />
          <div className="text-[10px] text-gray-600">
            {isSaving ? 'Guardando...' : 'Haga clic en la imagen para editar'}
          </div>
        </div>
      </div>

      {/* --- CUERPO SCROLLABLE --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

        {/* 1. ESTADÍSTICAS VITALES */}
        <div className="bg-black/40 p-3 rounded border border-gray-800">
          {/* Ruina */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-trophy-red font-serif font-bold uppercase text-sm">
              <Skull size={16} /> Ruina
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => handleChange('ruin', num)}
                  className={`w-7 h-7 rounded border flex items-center justify-center font-bold text-sm transition-all ${
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

          {/* Oro (Gold) o Impulso (Dark) */}
          {gameMode === 'gold' ? (
            <div className="flex justify-between items-center pt-2 border-t border-gray-800">
              <div className="flex items-center gap-2 text-trophy-gold font-serif font-bold uppercase text-sm">
                <Shield size={16} /> Oro
              </div>
              <input 
                type="number" 
                className="w-16 bg-black/50 border border-trophy-gold/30 rounded p-1 text-center text-trophy-gold focus:outline-none"
                value={charData.gold}
                onChange={(e) => handleChange('gold', parseInt(e.target.value) || 0)}
              />
            </div>
          ) : (
            <div className="pt-2">
               <label className="text-xs text-gray-500 uppercase">Impulso</label>
               <input 
                  type="text" 
                  className="w-full bg-black/30 border-b border-gray-700 text-sm py-1 focus:border-trophy-red outline-none"
                  value={charData.drive}
                  onChange={(e) => handleChange('drive', e.target.value)}
               />
            </div>
          )}
        </div>

        {/* 2. CONDICIONES (NUEVO) */}
        <div>
          <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-2">
            <HeartPulse size={12} /> Condiciones
          </label>
          <textarea 
            className="w-full bg-black/30 border border-gray-700 rounded p-2 text-sm focus:border-trophy-red outline-none h-20 resize-none placeholder-gray-700"
            value={charData.conditions}
            onChange={(e) => handleChange('conditions', e.target.value)}
            placeholder="Heridas, traumas, cicatrices..."
          />
        </div>

        {/* 3. INVENTARIO (DIFERENTE SEGÚN MODO) */}
        <div>
          <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-2">
            <Backpack size={12} /> Equipo
          </label>
          
          {gameMode === 'gold' ? (
            // MODO GOLD: SLOTS DE CARGA
            <div className="space-y-2">
              {charData.equipmentSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    className={`flex-1 bg-black/30 border ${slot ? 'border-gray-600' : 'border-gray-800'} rounded px-2 py-1 text-sm focus:border-trophy-gold outline-none transition-colors`}
                    value={slot}
                    onChange={(e) => handleSlotChange(idx, e.target.value)}
                    placeholder="Vacío"
                  />
                </div>
              ))}
              <p className="text-[10px] text-gray-500 text-right mt-1">
                Llenar más de 3 slots implica penalizadores.
              </p>
            </div>
          ) : (
            // MODO DARK: TEXTO SIMPLE
            <textarea 
              className="w-full bg-black/30 border border-gray-700 rounded p-2 text-sm focus:border-trophy-gold outline-none h-32"
              value={charData.inventory}
              onChange={(e) => handleChange('inventory', e.target.value)}
              placeholder="Antorchas, comida, armas..."
            />
          )}
        </div>

        {/* 4. RITUALES */}
        <div>
          <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-2">
            <Scroll size={12} /> Rituales
          </label>
          <textarea 
            className="w-full bg-black/30 border border-gray-700 rounded p-2 text-sm focus:border-trophy-gold outline-none h-24"
            value={charData.rituals}
            onChange={(e) => handleChange('rituals', e.target.value)}
            placeholder="Rituales conocidos..."
          />
        </div>

      </div>
    </div>
  );
};

export default CharacterSheet;