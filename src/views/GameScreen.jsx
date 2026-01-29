import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { subscribeToRoom, joinRoom, subscribeToMessages } from '../services/roomService';
import DiceConsole from '../components/game/DiceConsole';
import CharacterSheet from '../components/game/CharacterSheet';
import VisualBoard from '../components/game/VisualBoard';
// Iconos
import { MessageSquare, Eye, Scroll, User, Sword, Skull, Compass, AlertTriangle } from 'lucide-react'; 

const GameScreen = () => {
  const { roomId } = useParams();
  const { user, login } = useGame();
  
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [joinName, setJoinName] = useState('');
  
  const [mobileTab, setMobileTab] = useState('visual'); 
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    const unsubRoom = subscribeToRoom(roomId, (data) => setRoomData(data));
    const unsubMsg = subscribeToMessages(roomId, (msgs) => setMessages(msgs));
    if (user?.name) joinRoom(roomId, user.name);
    return () => { unsubRoom(); unsubMsg(); };
  }, [roomId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- RENDERIZADO DE MENSAJES v2.1.3 ---
  const renderMessage = (msg) => {
    if (['risk', 'combat', 'hunt', 'ruin', 'roll'].includes(msg.type)) {
      
      let borderColor = 'border-gray-700';
      let icon = <AlertTriangle size={14} className="text-trophy-gold" />;
      let title = "Tirada de Riesgo";
      
      if (msg.type === 'combat') {
        borderColor = 'border-red-900';
        icon = <Sword size={14} className="text-red-500" />;
        title = "Combate";
      } else if (msg.type === 'hunt') {
        borderColor = 'border-green-800';
        icon = <Compass size={14} className="text-green-500" />;
        title = "Exploración";
      } else if (msg.type === 'ruin') {
        borderColor = 'border-gray-600';
        icon = <Skull size={14} className="text-gray-400" />;
        title = "Prueba de Ruina";
      }

      // Colores del Texto de Resultado
      let outcomeColor = 'text-gray-400'; // Fallo normal
      if (msg.outcome === 'success') outcomeColor = 'text-green-400';
      if (msg.outcome === 'partial') outcomeColor = 'text-yellow-400';
      if (msg.outcome === 'critical_failure') outcomeColor = 'text-red-600'; // Pifia (Exploración 1)
      if (msg.type === 'ruin') outcomeColor = 'text-white';

      return (
        <div className={`bg-black/40 border ${borderColor} rounded p-2 mb-2`}>
          {/* Cabecera */}
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-white/10">
            <span className="font-bold text-trophy-gold text-sm">{msg.user}</span>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase">
              {icon} {title}
            </div>
          </div>
          
          {/* Dados */}
          <div className="flex flex-wrap gap-1 mb-2 justify-center">
            {msg.lightRolls && msg.lightRolls.map((r, i) => (
              <span key={`l-${i}`} className={`w-8 h-8 flex items-center justify-center font-bold rounded shadow-sm text-lg ${
                msg.type === 'combat' && r >= msg.targetNumber ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'
              }`}>
                {r}
              </span>
            ))}
            {msg.darkRolls && msg.darkRolls.map((r, i) => (
              <span key={`d-${i}`} className={`w-8 h-8 flex items-center justify-center font-bold rounded shadow-sm border text-lg ${
                msg.type === 'combat' && r >= msg.targetNumber ? 'bg-green-900 text-green-200 border-green-500' : 'bg-trophy-red text-black border-red-900'
              }`}>
                {r}
              </span>
            ))}
          </div>

          {/* Resultado Detallado (Aquí está el cambio clave) */}
          <div className="text-xs text-center px-1">
             <div className={`font-bold uppercase tracking-wider mb-1 ${outcomeColor}`}>
               {msg.outcomeTitle || 'Resultado...'}
             </div>
             
             {/* Descripción en cursiva pequeña */}
             {msg.outcomeDesc && (
               <div className="text-[10px] text-gray-400 italic leading-tight mb-1">
                 {msg.outcomeDesc}
               </div>
             )}
             
             {msg.type === 'combat' && (
               <div className="text-[10px] text-gray-500">vs Aguante {msg.targetNumber}</div>
             )}
             
             {msg.isDarkHighest && (
                <div className="mt-2 flex items-center justify-center gap-1 text-trophy-red font-bold animate-pulse bg-red-900/20 p-1 rounded border border-red-900/30">
                  <Skull size={12} /> ¡POSIBLE RUINA!
                </div>
             )}
          </div>
        </div>
      );
    } 
    
    return (
      <div className="text-gray-300 mb-2 text-sm px-2">
        <span className="font-bold text-gray-500 mr-2">{msg.user}:</span>
        {msg.text}
      </div>
    );
  };

  // --- RESTO DEL COMPONENTE IGUAL QUE ANTES ---
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-trophy-dark text-trophy-text p-4">
        <div className="bg-trophy-panel p-8 rounded-lg shadow-2xl border border-gray-800 max-w-md w-full text-center">
          <h2 className="text-2xl font-serif text-trophy-gold mb-4">Identifícate</h2>
          <p className="mb-6 text-gray-400">Estás entrando en la sala <strong>{roomId}</strong>.</p>
          <input
            type="text"
            placeholder="Tu nombre..."
            className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white mb-4 focus:border-trophy-gold outline-none"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && joinName.trim() && login(joinName)}
          />
          <button
            onClick={() => joinName.trim() && login(joinName)}
            className="w-full py-3 bg-trophy-red hover:bg-red-800 text-white font-bold rounded transition-colors"
          >
            Entrar a la Incursión
          </button>
        </div>
      </div>
    );
  }

  if (!roomData) return <div className="flex h-screen items-center justify-center text-trophy-gold">Cargando...</div>;

  return (
    <div className="flex h-screen w-full bg-trophy-dark overflow-hidden text-sm relative">
      <div className={`absolute inset-0 z-10 bg-trophy-dark flex flex-col md:relative md:z-0 md:flex md:w-1/4 md:min-w-[320px] md:border-r md:border-gray-800 ${mobileTab === 'chat' ? 'flex' : 'hidden'}`}>
        <div className="p-3 border-b border-gray-800 bg-black/40 flex justify-between items-center">
          <h3 className="text-trophy-gold font-serif font-bold">Registro</h3>
          <span className="text-xs text-gray-500">{roomData.players?.length} aventureros</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar pb-24 md:pb-4">
          {messages.map((msg) => (<div key={msg.id} className="animate-fade-in">{renderMessage(msg)}</div>))}
          <div ref={chatEndRef} />
        </div>
        <div className="border-t border-gray-800 md:relative"><DiceConsole roomId={roomId} /></div>
        <div className="h-16 md:hidden"></div>
      </div>
      <div className={`absolute inset-0 z-0 bg-black flex flex-col md:relative md:flex-1 md:border-r md:border-gray-800 ${mobileTab === 'visual' ? 'flex' : 'hidden'}`}>
        <VisualBoard roomId={roomId} roomData={roomData} />
        <div className="h-16 md:hidden bg-black"></div>
      </div>
      <div className={`absolute inset-0 z-10 bg-trophy-panel flex flex-col md:relative md:z-0 md:flex md:w-1/4 md:min-w-[350px] md:border-l md:border-gray-800 ${mobileTab === 'sheet' ? 'flex' : 'hidden'}`}>
         <div className="flex-1 overflow-hidden relative"><CharacterSheet roomId={roomId} gameMode={roomData.gameMode} /></div>
         <div className="h-16 md:hidden bg-trophy-panel"></div>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-trophy-panel border-t border-gray-700 flex justify-around p-3 z-50 shadow-2xl pb-safe">
        <button onClick={() => setMobileTab('chat')} className={`flex flex-col items-center gap-1 ${mobileTab === 'chat' ? 'text-trophy-gold' : 'text-gray-500'}`}><MessageSquare size={20} /><span className="text-[10px] font-bold uppercase">Chat</span></button>
        <button onClick={() => setMobileTab('visual')} className={`flex flex-col items-center gap-1 ${mobileTab === 'visual' ? 'text-trophy-gold' : 'text-gray-500'}`}><Eye size={20} /><span className="text-[10px] font-bold uppercase">Visual</span></button>
        <button onClick={() => setMobileTab('sheet')} className={`flex flex-col items-center gap-1 ${mobileTab === 'sheet' ? 'text-trophy-gold' : 'text-gray-500'}`}><User size={20} /><span className="text-[10px] font-bold uppercase">Ficha</span></button>
      </div>
    </div>
  );
};

export default GameScreen;