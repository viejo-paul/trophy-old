import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { subscribeToRoom, joinRoom, subscribeToMessages } from '../services/roomService';
import DiceConsole from '../components/game/DiceConsole';
import CharacterSheet from '../components/game/CharacterSheet';
import VisualBoard from '../components/game/VisualBoard';
// Iconos para el menú móvil
import { MessageSquare, Eye, Scroll, User } from 'lucide-react'; 

const GameScreen = () => {
  const { roomId } = useParams();
  const { user, login } = useGame();
  
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [joinName, setJoinName] = useState('');
  
  // ESTADO VISUAL PARA MÓVILES ('chat', 'visual', 'sheet')
  const [mobileTab, setMobileTab] = useState('visual'); 
  
  const chatEndRef = useRef(null);

  // --- EFECTOS Y LÓGICA DE CONEXIÓN (Igual que antes) ---
  useEffect(() => {
    if (!roomId) return;
    const unsubRoom = subscribeToRoom(roomId, (data) => setRoomData(data));
    const unsubMsg = subscribeToMessages(roomId, (msgs) => setMessages(msgs));

    if (user?.name) joinRoom(roomId, user.name);

    return () => {
      unsubRoom();
      unsubMsg();
    };
  }, [roomId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- PORTERO (LOGIN) ---
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
      
      {/* ------------------------------------------------------
          COLUMNA 1: CHAT Y DADOS
          En Móvil: Solo visible si mobileTab === 'chat'
          En PC (md): Siempre visible (w-1/4)
      ------------------------------------------------------ */}
      <div className={`
        absolute inset-0 z-10 bg-trophy-dark flex flex-col
        md:relative md:z-0 md:flex md:w-1/4 md:min-w-[320px] md:border-r md:border-gray-800
        ${mobileTab === 'chat' ? 'flex' : 'hidden'}
      `}>
        {/* Cabecera Chat */}
        <div className="p-3 border-b border-gray-800 bg-black/40 flex justify-between items-center">
          <h3 className="text-trophy-gold font-serif font-bold">Registro</h3>
          <span className="text-xs text-gray-500">{roomData.players?.length} aventureros</span>
        </div>

        {/* Mensajes */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar pb-24 md:pb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2 animate-fade-in">
              {msg.type === 'roll' ? (
                <div className="bg-black/40 border border-gray-700 rounded p-2">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-trophy-gold">{msg.user}</span>
                    <span className="text-xs text-gray-500">tira dados</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {msg.lightRolls.map((r, i) => (
                      <span key={`l-${i}`} className="w-6 h-6 flex items-center justify-center bg-gray-200 text-black font-bold rounded shadow-sm">{r}</span>
                    ))}
                    {msg.darkRolls.map((r, i) => (
                      <span key={`d-${i}`} className="w-6 h-6 flex items-center justify-center bg-trophy-red text-black font-bold rounded shadow-sm border border-red-900">{r}</span>
                    ))}
                  </div>
                  <div className="text-xs border-t border-gray-700 pt-1 flex justify-between">
                    <span className={`uppercase font-bold ${
                      msg.outcome === 'success' ? 'text-green-400' : 
                      msg.outcome === 'partial' ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {msg.outcome === 'success' ? 'Éxito' : msg.outcome === 'partial' ? 'Con coste' : 'Fallo'}
                    </span>
                    {msg.isDarkHighest && <span className="text-trophy-red font-bold animate-pulse">¡RUINA!</span>}
                  </div>
                </div>
              ) : (
                <div className="text-gray-300">
                  <span className="font-bold text-gray-500">{msg.user}:</span> {msg.text}
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Consola Dados (Fija abajo en móvil para que no moleste el teclado) */}
        <div className="border-t border-gray-800 md:relative">
          <DiceConsole roomId={roomId} />
        </div>
        
        {/* Espaciador para la barra de navegación móvil */}
        <div className="h-16 md:hidden"></div>
      </div>

      {/* ------------------------------------------------------
          COLUMNA 2: VISUAL (CENTRO)
          En Móvil: Solo visible si mobileTab === 'visual'
          En PC (md): Siempre visible (flex-1)
      ------------------------------------------------------ */}
      <div className={`
        absolute inset-0 z-0 bg-black flex flex-col
        md:relative md:flex-1 md:border-r md:border-gray-800
        ${mobileTab === 'visual' ? 'flex' : 'hidden'}
      `}>
        <VisualBoard roomId={roomId} roomData={roomData} />
        {/* Espaciador móvil */}
        <div className="h-16 md:hidden bg-black"></div>
      </div>

      {/* ------------------------------------------------------
          COLUMNA 3: FICHA
          En Móvil: Solo visible si mobileTab === 'sheet'
          En PC (md): Siempre visible (w-1/4)
      ------------------------------------------------------ */}
      <div className={`
        absolute inset-0 z-10 bg-trophy-panel flex flex-col
        md:relative md:z-0 md:flex md:w-1/4 md:min-w-[350px] md:border-l md:border-gray-800
        ${mobileTab === 'sheet' ? 'flex' : 'hidden'}
      `}>
         {/* Wrapper para el scroll de la ficha */}
         <div className="flex-1 overflow-hidden relative">
            <CharacterSheet roomId={roomId} gameMode={roomData.gameMode} />
         </div>
         {/* Espaciador móvil */}
         <div className="h-16 md:hidden bg-trophy-panel"></div>
      </div>

      {/* ------------------------------------------------------
          BARRA DE NAVEGACIÓN MÓVIL (SOLO VISIBLE EN MÓVIL)
      ------------------------------------------------------ */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-trophy-panel border-t border-gray-700 flex justify-around p-3 z-50 shadow-2xl pb-safe">
        <button 
          onClick={() => setMobileTab('chat')}
          className={`flex flex-col items-center gap-1 ${mobileTab === 'chat' ? 'text-trophy-gold' : 'text-gray-500'}`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-bold uppercase">Chat</span>
        </button>
        
        <button 
          onClick={() => setMobileTab('visual')}
          className={`flex flex-col items-center gap-1 ${mobileTab === 'visual' ? 'text-trophy-gold' : 'text-gray-500'}`}
        >
          <Eye size={20} />
          <span className="text-[10px] font-bold uppercase">Visual</span>
        </button>
        
        <button 
          onClick={() => setMobileTab('sheet')}
          className={`flex flex-col items-center gap-1 ${mobileTab === 'sheet' ? 'text-trophy-gold' : 'text-gray-500'}`}
        >
          <User size={20} />
          <span className="text-[10px] font-bold uppercase">Ficha</span>
        </button>
      </div>

    </div>
  );
};

export default GameScreen;