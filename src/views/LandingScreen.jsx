import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createIncursion, checkRoomExists, getHistory } from '../services/roomService';
import { Scroll, Sword, Users, History, AlertCircle } from 'lucide-react';

const LandingScreen = () => {
  const navigate = useNavigate();
  
  // ESTADO: Control de pestañas y formulario
  const [activeTab, setActiveTab] = useState('create'); // 'create' o 'join'
  const [gmName, setGmName] = useState('');
  const [adventureTitle, setAdventureTitle] = useState('');
  const [joinCode, setJoinCode] = useState('');
  
  // ESTADO: Visual y Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // EFECTO: Cargar historial al entrar
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // FUNCIÓN 1: CREAR NUEVA INCURSIÓN
  const handleCreate = async (e) => {
    e.preventDefault();
    // Validación básica
    if (!gmName.trim() || !adventureTitle.trim()) {
      setError('El Guardián necesita nombre y la incursión un título.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // ID temporal del usuario (luego usaremos Auth real)
      const tempUserId = 'gm_' + Date.now();
      
      // Llamamos a la nueva función de roomService
      const newRoomId = await createIncursion(adventureTitle, gmName, tempUserId);
      
      // Nos vamos a la sala creada
      navigate(`/room/${newRoomId}`);
    } catch (err) {
      console.error(err);
      setError('Error invocando la sala. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // FUNCIÓN 2: UNIRSE A UNA EXISTENTE
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Verificamos si la sala existe realmente
      const exists = await checkRoomExists(joinCode);
      if (exists) {
        navigate(`/room/${joinCode}`);
      } else {
        setError('Esa incursión no existe o ha desaparecido.');
      }
    } catch (err) {
      setError('Error al buscar la sala.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-amber-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-amber-900 selection:text-white">
      
      {/* CABECERA: Logo y Subtítulo */}
      <header className="mb-8 text-center animate-fade-in-down">
        <h1 className="text-5xl md:text-6xl font-bold text-amber-600 tracking-wider mb-2 drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)] font-serif">
          Trophy (g)Old
        </h1>
        <p className="text-slate-500 italic tracking-widest text-sm uppercase">
          Donde el oro reclama su precio
        </p>
      </header>

      {/* TARJETA PRINCIPAL: El Tablón */}
      <main className="w-full max-w-md bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden relative">
        
        {/* PESTAÑAS SUPERIORES */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2
              ${activeTab === 'create' 
                ? 'bg-slate-800 text-amber-500 border-b-2 border-amber-500' 
                : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/50'
              }`}
          >
            <Scroll size={16} />
            Nueva incursión
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2
              ${activeTab === 'join' 
                ? 'bg-slate-800 text-amber-500 border-b-2 border-amber-500' 
                : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/50'
              }`}
          >
            <Users size={16} />
            Unirse
          </button>
        </div>

        {/* CONTENIDO DEL FORMULARIO */}
        <div className="p-8">
          {/* Mensajes de Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-950/40 border border-red-900/50 text-red-300 text-xs rounded flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* FORMULARIO: CREAR */}
          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Guardián</label>
                <input
                  type="text"
                  value={gmName}
                  onChange={(e) => setGmName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:border-amber-600 focus:outline-none placeholder:text-slate-700"
                  placeholder="Tu Nombre"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Incursión</label>
                <input
                  type="text"
                  value={adventureTitle}
                  onChange={(e) => setAdventureTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:border-amber-600 focus:outline-none placeholder:text-slate-700"
                  placeholder="Título de la Aventura"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3.5 rounded shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isLoading ? 'Invocando...' : <><Sword size={18} /> Comenzar la exploración</>}
              </button>
            </form>
          ) : (
            /* FORMULARIO: UNIRSE */
            <form onSubmit={handleJoin} className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Código</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-center font-mono text-lg tracking-widest text-amber-500 focus:border-amber-600 focus:outline-none placeholder:text-slate-800"
                  placeholder="ID-DE-SALA"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3.5 rounded shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isLoading ? 'Buscando...' : <><Users size={18} /> Unirse a la mesa...</>}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* HISTORIAL RECIENTE (Abajo) */}
      {history.length > 0 && (
        <section className="mt-10 w-full max-w-md animate-fade-in-up">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-4 text-center flex items-center justify-center gap-2">
            <History size={12} />
            Incursiones Recientes
          </h3>
          <ul className="space-y-2">
            {history.map((game) => (
              <li key={game.id}>
                <button
                  onClick={() => navigate(`/room/${game.id}`)}
                  className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-900/50 p-3 rounded transition-all group text-left"
                >
                  <span className="text-slate-400 group-hover:text-amber-500 font-medium text-sm transition-colors">
                    {game.title}
                  </span>
                  <span className="text-[10px] text-slate-700 font-mono group-hover:text-slate-500">
                    {game.id.slice(0, 6)}...
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default LandingScreen;