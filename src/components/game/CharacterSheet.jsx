import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { updateCharacter, subscribeToCharacter } from '../../services/roomService';
import { 
  User, Shield, Skull, Scroll, HeartPulse, Backpack, 
  Sword, Coins, Edit2, Maximize2, X, AlertCircle 
} from 'lucide-react';

const CharacterSheet = ({ roomId, gameMode }) => {
  const { user } = useGame();
  
  // --- ESTADO INICIAL COMPLETO (Estructura v2.1) ---
  const [charData, setCharData] = useState({
    // Cabecera
    name: user.name,
    playerName: user.name, // Nuevo campo
    avatar: '',

    // Stats
    ruin: 1,
    gold: 0,
    debt: 0, // Nuevo
    tokens: 0, // Nuevo (Exploración)

    // Bio
    occupation: '',
    background: '',
    drive: '', // Motivación

    // Habilidades (4 slots)
    skills: ['', '', '', ''], 

    // Condiciones
    conditions: '',

    // Equipo de Combate (5 armas, 5 armaduras)
    weapons: ['', '', '', '', ''],
    armor: ['', '', '', '', ''],

    // Mochila (6 slots numerados)
    equipmentSlots: ['', '', '', '', '', ''],

    // Rituales (5 slots dobles: nombre + desc)
    ritualsDetailed: [
      { name: '', desc: '' },
      { name: '', desc: '' },
      { name: '', desc: '' },
      { name: '', desc: '' },
      { name: '', desc: '' }
    ],

    // Campaña
    goldStash: 0,
    
    // Notas
    notes: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false); // Para el zoom de imagen

  // 1. ESCUCHAR DATOS DE FIREBASE
  useEffect(() => {
    const unsubscribe = subscribeToCharacter(roomId, user.name, (data) => {
      if (data && Object.keys(data).length > 0) {
        // Fusionamos datos asegurando que los arrays nuevos existan si la ficha es vieja
        setCharData(prev => ({
          ...prev,
          ...data,
          skills: data.skills || ['', '', '', ''],
          weapons: data.weapons || ['', '', '', '', ''],
          armor: data.armor || ['', '', '', '', ''],
          ritualsDetailed: data.ritualsDetailed || [
            { name: '', desc: '' }, { name: '', desc: '' }, 
            { name: '', desc: '' }, { name: '', desc: '' }, 
            { name: '', desc: '' }
          ],
        }));
      }
    });
    return () => unsubscribe();
  }, [roomId, user.name]);

  // 2. FUNCIÓN DE AUTO-GUARDADO
  const saveData = (newData) => {
    setCharData(newData);
    setIsSaving(true);
    updateCharacter(roomId, user.name, newData).then(() => {
      setTimeout(() => setIsSaving(false), 500);
    });
  };

  // Helpers para inputs simples
  const handleChange = (field, value) => {
    saveData({ ...charData, [field]: value });
  };

  // Helpers para Arrays simples (Skills, Weapons, Armor, Backpack)
  const handleArrayChange = (field, index, value) => {
    const newArray = [...charData[field]];
    newArray[index] = value;
    saveData({ ...charData, [field]: newArray });
  };

  // Helper para Rituales (Array de Objetos)
  const handleRitualChange = (index, subField, value) => {
    const newRituals = [...charData.ritualsDetailed];
    newRituals[index] = { ...newRituals[index], [subField]: value };
    saveData({ ...charData, ritualsDetailed: newRituals });
  };

  // Gestión de Avatar
  const handleAvatarEdit = (e) => {
    e.stopPropagation(); // Evitar abrir el modal al hacer click en editar
    const url = window.prompt("URL de la imagen del personaje:", charData.avatar);
    if (url !== null) handleChange('avatar', url);
  };

  return (
    <div className="h-full flex flex-col bg-trophy-panel text-trophy-text text-sm font-sans relative">
      
      {/* --- MODAL DE IMAGEN GRANDE --- */}
      {showImageModal && charData.avatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-full">
            <img src={charData.avatar} alt="Full view" className="max-w-full max-h-[90vh] rounded shadow-2xl border border-trophy-gold" />
            <button className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full p-2 hover:bg-red-700">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* --- CABECERA --- */}
      <div className="p-4 border-b border-gray-700 bg-black/30 flex gap-4 items-start">
        {/* Avatar */}
        <div className="relative group">
          <div 
            onClick={() => charData.avatar && setShowImageModal(true)}
            className={`w-20 h-20 rounded-full border-2 border-trophy-gold overflow-hidden bg-black flex-shrink-0 flex items-center justify-center ${charData.avatar ? 'cursor-pointer hover:opacity-90' : ''}`}
          >
            {charData.avatar ? (
              <img src={charData.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-gray-600" />
            )}
          </div>
          {/* Botón Editar Avatar (Pequeño, flotante) */}
          <button 
            onClick={handleAvatarEdit}
            className="absolute bottom-0 right-0 bg-trophy-panel border border-trophy-gold rounded-full p-1.5 text-trophy-gold hover:bg-trophy-gold hover:text-black transition-colors"
            title="Cambiar Imagen"
          >
            <Edit2 size={12} />
          </button>
        </div>

        {/* Nombres */}
        <div className="flex-1 space-y-1 pt-1">
          <input 
            type="text" 
            className="w-full bg-transparent border-b border-transparent hover:border-gray-700 focus:border-trophy-gold font-serif text-xl text-trophy-gold font-bold focus:outline-none transition-colors"
            value={charData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nombre del Personaje"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase">Jugador:</span>
            <input 
              type="text" 
              className="flex-1 bg-transparent border-none text-xs text-gray-400 focus:text-white focus:outline-none"
              value={charData.playerName}
              onChange={(e) => handleChange('playerName', e.target.value)}
              placeholder="Tu Nombre"
            />
          </div>
          {isSaving && <span className="text-[10px] text-green-500 animate-pulse">Guardando...</span>}
        </div>
      </div>

      {/* --- CUERPO (SCROLL) --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-20">

        {/* 1. ESTADÍSTICAS (GRID 2x2) */}
        <div className="grid grid-cols-2 gap-3 bg-black/20 p-3 rounded border border-gray-800">
          
          {/* Ruina */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-trophy-red uppercase font-bold flex items-center gap-1"><Skull size={10}/> Ruina</label>
            <div className="flex gap-1 justify-between">
               {[1,2,3,4,5,6].map(n => (
                 <div 
                    key={n} 
                    onClick={() => handleChange('ruin', n)}
                    className={`h-6 flex-1 rounded border flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${charData.ruin >= n ? 'bg-trophy-red text-white border-trophy-red' : 'border-gray-800 text-gray-700 hover:border-gray-600'}`}
                 >{n}</div>
               ))}
            </div>
          </div>

          {/* Oro */}
          <div className="flex flex-col gap-1">
             <label className="text-[10px] text-trophy-gold uppercase font-bold flex items-center gap-1"><Coins size={10}/> Oro</label>
             <input type="number" className="w-full bg-black/40 border border-trophy-gold/30 rounded px-2 py-0.5 text-trophy-gold font-bold focus:outline-none" 
               value={charData.gold} onChange={(e) => handleChange('gold', parseInt(e.target.value)||0)} />
          </div>

          {/* Deuda */}
          <div className="flex flex-col gap-1">
             <label className="text-[10px] text-gray-400 uppercase font-bold">Deuda</label>
             <input type="number" className="w-full bg-black/40 border border-gray-700 rounded px-2 py-0.5 text-gray-300 focus:outline-none focus:border-red-900" 
               value={charData.debt} onChange={(e) => handleChange('debt', parseInt(e.target.value)||0)} />
          </div>

          {/* Tokens Exploración */}
          <div className="flex flex-col gap-1">
             <label className="text-[10px] text-green-500 uppercase font-bold">Tokens</label>
             <input type="number" className="w-full bg-black/40 border border-green-900 rounded px-2 py-0.5 text-green-400 focus:outline-none focus:border-green-500" 
               value={charData.tokens} onChange={(e) => handleChange('tokens', parseInt(e.target.value)||0)} />
          </div>
        </div>

        {/* 2. BIOGRAFÍA */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Ocupación</label>
              <input type="text" className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white focus:border-trophy-gold outline-none"
                value={charData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} placeholder="Ej. Cazador" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Motivación (Drive)</label>
              <input type="text" className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white focus:border-trophy-gold outline-none"
                value={charData.drive} onChange={(e) => handleChange('drive', e.target.value)} placeholder="¿Por qué te arriesgas?" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Trasfondo</label>
            <textarea className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white focus:border-trophy-gold outline-none h-16 resize-none"
              value={charData.background} onChange={(e) => handleChange('background', e.target.value)} placeholder="¿De dónde vienes? ¿En qué eres experto?" />
          </div>
        </div>

        {/* 3. HABILIDADES (4 Slots) */}
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Habilidades</label>
          <div className="grid grid-cols-2 gap-2">
            {charData.skills.map((skill, i) => (
              <input key={i} type="text" className="bg-black/30 border border-gray-700 rounded px-2 py-1.5 focus:border-trophy-gold outline-none"
                value={skill} onChange={(e) => handleArrayChange('skills', i, e.target.value)} placeholder={`Habilidad ${i+1}`} />
            ))}
          </div>
        </div>

        {/* 4. CONDICIONES */}
        <div>
          <label className="text-[10px] text-trophy-red uppercase tracking-wider mb-1 flex items-center gap-1"><HeartPulse size={10}/> Condiciones y Cicatrices</label>
          <textarea className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white focus:border-trophy-red outline-none h-16 resize-none"
            value={charData.conditions} onChange={(e) => handleChange('conditions', e.target.value)} placeholder="Estados alterados..." />
        </div>

        {/* 5. EQUIPO DE COMBATE (5 Armas + 5 Armaduras) */}
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Sword size={10}/> Equipo de Combate</label>
          <div className="grid grid-cols-2 gap-4 bg-black/20 p-3 rounded border border-gray-800">
            {/* Armas */}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 block text-center mb-1">ARMAS</span>
              {charData.weapons.map((w, i) => (
                <input key={i} type="text" className="w-full bg-black/40 border border-gray-700 rounded px-2 py-1 text-xs focus:border-trophy-gold outline-none"
                  value={w} onChange={(e) => handleArrayChange('weapons', i, e.target.value)} />
              ))}
            </div>
            {/* Armaduras */}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 block text-center mb-1">ARMADURAS</span>
              {charData.armor.map((a, i) => (
                <input key={i} type="text" className="w-full bg-black/40 border border-gray-700 rounded px-2 py-1 text-xs focus:border-gray-500 outline-none"
                  value={a} onChange={(e) => handleArrayChange('armor', i, e.target.value)} />
              ))}
            </div>
          </div>
        </div>

        {/* 6. MOCHILA (6 Slots numerados) */}
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Backpack size={10}/> Equipo en la Mochila</label>
          <div className="space-y-1">
            {charData.equipmentSlots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600 w-3">{i+1}</span>
                <input type="text" className={`flex-1 bg-black/30 border ${slot ? 'border-gray-600' : 'border-gray-800'} rounded px-2 py-1 text-sm focus:border-trophy-gold outline-none`}
                  value={slot} onChange={(e) => handleArrayChange('equipmentSlots', i, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* 7. RITUALES (5 filas dobles) */}
        <div>
           <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Scroll size={10}/> Rituales</label>
           <div className="space-y-3">
             {charData.ritualsDetailed.map((ritual, i) => (
               <div key={i} className="bg-black/20 p-2 rounded border border-gray-800">
                 <input type="text" className="w-full bg-transparent border-b border-gray-700 text-trophy-gold font-bold mb-1 focus:outline-none placeholder-gray-700"
                   value={ritual.name} onChange={(e) => handleRitualChange(i, 'name', e.target.value)} placeholder="Nombre del Ritual" />
                 <textarea className="w-full bg-transparent text-xs text-gray-400 resize-none h-10 focus:outline-none placeholder-gray-800"
                   value={ritual.desc} onChange={(e) => handleRitualChange(i, 'desc', e.target.value)} placeholder="Descripción..." />
               </div>
             ))}
           </div>
        </div>

        {/* 8. CAMPAÑA Y NOTAS */}
        <div className="bg-yellow-900/10 p-3 rounded border border-yellow-900/30 space-y-3">
           <div>
              <label className="text-[10px] text-trophy-gold uppercase tracking-wider block mb-1">Reserva de Oro (Stash)</label>
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-trophy-gold"/>
                <input type="number" className="flex-1 bg-black/50 border border-trophy-gold/50 rounded p-1 font-serif text-lg text-trophy-gold"
                   value={charData.goldStash} onChange={(e) => handleChange('goldStash', parseInt(e.target.value)||0)} />
              </div>
           </div>
           <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Notas de Campaña</label>
              <textarea className="w-full bg-black/50 border border-gray-700 rounded p-2 text-xs h-20 focus:border-trophy-gold outline-none resize-none"
                 value={charData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Rumores, nombres, deudas..." />
           </div>
        </div>
        
        {/* Espacio final para scroll */}
        <div className="h-10"></div>

      </div>
    </div>
  );
};

export default CharacterSheet;