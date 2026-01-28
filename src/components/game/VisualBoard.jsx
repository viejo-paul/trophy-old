import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateRoom } from '../../services/roomService';
import { useGame } from '../../context/GameContext';
import { Settings, Image as ImageIcon, FileText } from 'lucide-react'; // Iconos bonitos

const VisualBoard = ({ roomId, roomData }) => {
  const { t } = useTranslation();
  const { user } = useGame();
  
  // Verificamos si soy el creador de la sala
  const isHost = user.name === roomData.host;

  // Estados locales para el formulario del GM
  const [showTools, setShowTools] = useState(false);
  const [bgUrl, setBgUrl] = useState(roomData.currentScene || '');
  const [notes, setNotes] = useState(roomData.notes || '');

  const handleUpdate = () => {
    updateRoom(roomId, {
      currentScene: bgUrl,
      notes: notes
    });
    setShowTools(false); // Cerramos el panel al guardar
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
      
      {/* 1. LA IMAGEN DE FONDO (El Escenario) */}
      {roomData.currentScene ? (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${roomData.currentScene})`, opacity: 0.6 }}
        />
      ) : (
        // Si no hay imagen, mostramos un placeholder elegante
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="text-center">
            <ImageIcon size={64} className="mx-auto mb-4 text-trophy-gold" />
            <span className="text-2xl font-serif text-gray-500">Sin Escena Establecida</span>
          </div>
        </div>
      )}

      {/* 2. TÍTULO DE LA SALA (Superpuesto) */}
      <div className="relative z-10 w-full p-6 bg-gradient-to-b from-black/90 to-transparent">
        <h1 className="text-center text-3xl md:text-4xl font-serif text-trophy-gold drop-shadow-lg tracking-wider">
          {roomData.id}
        </h1>
      </div>

      {/* 3. PANEL DE HERRAMIENTAS (Solo para el GM) */}
      {isHost && (
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end">
          
          {/* Botón flotante para abrir/cerrar */}
          <button 
            onClick={() => setShowTools(!showTools)}
            className="p-3 bg-trophy-panel border border-trophy-gold/50 rounded-full text-trophy-gold hover:bg-trophy-gold hover:text-black transition-colors shadow-lg mb-2"
            title="Herramientas de Guardián"
          >
            <Settings size={24} />
          </button>

          {/* El Panel Desplegable */}
          {showTools && (
            <div className="w-80 bg-trophy-panel border border-gray-700 rounded-lg shadow-2xl p-4 animate-fade-in-up">
              <h3 className="font-serif text-trophy-gold mb-3 flex items-center gap-2">
                <Settings size={16} /> Panel de Guardián
              </h3>
              
              {/* Input URL Imagen */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 uppercase block mb-1">
                  {t('gm_tools.visual_url')}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 bg-black/50 border border-gray-600 rounded p-2 text-xs text-white"
                    placeholder="https://..."
                    value={bgUrl}
                    onChange={(e) => setBgUrl(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Tip: Copia la dirección de imagen de Pinterest o Unsplash.</p>
              </div>

              {/* Input Notas (Secretas) */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 uppercase block mb-1 flex items-center gap-1">
                  <FileText size={12} /> {t('gm_tools.notes')}
                </label>
                <textarea 
                  className="w-full bg-black/50 border border-gray-600 rounded p-2 text-xs text-white h-24 resize-none"
                  placeholder={t('gm_tools.placeholder_notes')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Botón Guardar */}
              <button 
                onClick={handleUpdate}
                className="w-full py-2 bg-trophy-gold hover:bg-yellow-600 text-black font-bold text-xs rounded uppercase tracking-widest"
              >
                {t('gm_tools.update')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisualBoard;