import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { subscribeToRoom, joinRoom, subscribeToMessages } from '../services/roomService';
import DiceConsole from '../components/game/DiceConsole';
import CharacterSheet from '../components/game/CharacterSheet';
import VisualBoard from '../components/game/VisualBoard';
// Quitamos los Dice1...Dice6 que daban problemas
import { 
  MessageSquare, Eye, User, Sword, Skull, Compass, AlertTriangle, Dices
} from 'lucide-react'; 

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

  // --- NUEVO: DIBUJAR DADO CON HTML/CSS (Más robusto y bonito) ---
  const D6 = ({ value, isDark }) => {
    // Posiciones de los puntos para cada número (grid 3x3)
    const dotMap = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };
    
    // Estilos base
    const baseClass = `w-8 h-8 rounded flex flex-wrap content-between justify-between p-1.5 shadow-sm border`;
    // Dado Claro: Blanco con puntos negros
    const lightClass = "bg-gray-200 border-gray-400"; 
    // Dado Oscuro: Negro con puntos blancos y borde gris
    const darkClass = "bg-black border-gray-600 shadow-md"; 
    
    const dotColor = isDark ? "bg-white" : "bg-black";

    return (
      <div className={`${baseClass} ${isDark ? darkClass : lightClass} relative`}>
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="w-1.5 h-1.5 flex items-center justify-center">
            {dotMap[value]?.includes(i) && (
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // --- RENDERIZADO DE MENSAJES ---
  const renderMessage = (msg) => {
    if (['risk', 'combat', 'hunt', 'free', 'roll'].includes(msg.type)) {
      
      let borderColor = 'border-gray-700';
      let icon = <AlertTriangle size={14} className="text-trophy-gold" />;
      let title = "Tirada de Riesgo";
      
      if (msg.type === 'combat') {
        borderColor = 'border-red-900';
        icon = <Sword size={14} className="text-red-500" />;
        title = "Ataque Grupal";
      } else if (msg.type === 'hunt') {
        borderColor = 'border-green-800';
        icon = <Compass size={14} className="text-green-500" />;
        title = "Exploración";
      } else if (msg.type === 'free') {
        borderColor = 'border-gray-500';
        icon = <Dices size={14} className="text-white" />;
        title = "Tirada Libre";
      }

      // Colores de Texto
      let outcomeColor = 'text-gray-400';
      if (msg.outcome === 'success') outcomeColor = 'text-green-400';
      if (msg.outcome === 'partial') outcomeColor = 'text-yellow-400';
      if (msg.outcome === 'critical_failure') outcomeColor = 'text-red-600';
      if (msg.type === 'combat') outcomeColor = 'text-red-300';
      if (msg.type === 'free') outcomeColor = 'text-gray-300';

      return (
        <div className={`bg-black/40 border ${borderColor} rounded p-2 mb-2`}>
          {/* Cabecera */}
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-white/10">
            <span className="font-bold text-trophy-gold text-sm">{msg.user}</span>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase">
              {icon} {title}
            </div>
          </div>
          
          {/* Dados VISUALES */}
          <div className="flex flex-col items-center mb-2">
             {/* Dados Claros */}
             {msg.lightRolls && msg.lightRolls.length > 0 && (
               <div className="flex items-center gap-2 mb-1">
                 {msg.type === 'combat' && <span className="text-[9px] text-gray-500 uppercase">Punto Débil:</span>}
                 {msg.lightRolls.map((r, i) => (
                    // Usamos el nuevo componente D6 isDark={false}
                    <D6 key={`l-${i}`} value={r} isDark={false} />
                 ))}
               </div>
             )}

             {/* Dados Oscuros */}
             {msg.darkRolls && msg.darkRolls.length > 0 && (
               <div className="flex items-center gap-2">
                 {msg.type === 'combat' && <span className="text-[9px] text-red-400 uppercase">Ataque:</span>}
                 <div className="flex flex-wrap gap-1">
                    {msg.darkRolls.map((r, i) => (
                      // Usamos el nuevo componente D6 isDark={true}
                      <D6 key={`d-${i}`} value={r} isDark={true} />
                    ))}
                 </div>
               </div>
             )}
          </div>

          {/* Resultado Detallado */}
          <div className="text-xs text-center px-1">
             <div className={`font-bold uppercase tracking-wider mb-1 ${outcomeColor}`}>
               {msg.outcomeTitle || 'Resultado...'}
             </div>
             
             {msg.outcomeDesc && (
               <div className="text-[10px] text-gray-400 italic leading-tight">
                 {msg.outcomeDesc}
               </div>
             )}
             
             {msg.isDarkHighest && msg.type !== 'combat' && msg.type !== 'free' && (
                <div className="mt-2 flex items-center justify-center gap-1 text-trophy-red font-bold animate-pulse bg-red-900/20 p-1 rounded border border-red-900/30">
                  <Skull size={12} /> ¡POSIBLE RUINA!
                </div>
             )}
          </div>
        </div>
      );
    } 
    
    // Fallback para mensajes antiguos o de texto
    return (
      <div className="text-gray-300 mb-2 text-sm px-2">
        <span className="font-bold text-gray-500 mr-2">{msg.user}:</span>
        {msg.text}
      </div>
    );
  };

  if (!user) {
    // LOGIN (Sin cambios)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-trophy-dark text-trophy-text p-4">
        <div className="bg-trophy-panel p-8 rounded-lg shadow-2xl border border-gray-800 max-w-md w-full text-center">
          <h2 className="text-2xl font-serif text-trophy-gold mb-4">Identifícate</h2>
          <p className="mb-6 text-gray-400">Estás entrando en la sala <strong>{roomId}</strong>.</p>
          <input type="text" placeholder="Tu nombre..." className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white mb-4 focus:border-trophy-gold outline-none" value={joinName} onChange={(e) => setJoinName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && joinName.trim() && login(joinName)} />
          <button onClick={() => joinName.trim() && login(joinName)} className="w-full py-3 bg-trophy-red hover:bg-red-800 text-white font-bold rounded transition-colors">Entrar a la Incursión</button>
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