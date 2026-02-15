import React from 'react';
import { useNavigate } from 'react-router-dom';

const LobbyScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-trophy-dark flex flex-col items-center justify-center text-trophy-text">
      <h2 className="text-3xl font-serif text-trophy-gold mb-4">Sala de Espera</h2>
      <p className="mb-6 text-stone-400">Esta zona está en construcción.</p>
      
      <button 
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded border border-stone-600"
      >
        Volver al Inicio
      </button>
    </div>
  );
};

export default LobbyScreen;