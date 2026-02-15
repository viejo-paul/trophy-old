import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext'; // Nos aseguramos de que el estado envuelva las rutas

// Importamos las vistas (aunque algunas estén vacías por ahora, las rellenaremos luego)
import LandingScreen from './views/LandingScreen';
import LobbyScreen from './views/LobbyScreen';
import GameScreen from './views/GameScreen';

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-stone-950 text-stone-200 font-serif selection:bg-amber-900 selection:text-white">
          <Routes>
            {/* Ruta 1: La portada principal */}
            <Route path="/" element={<LandingScreen />} />

            {/* Ruta 2: Donde creas o buscas partida */}
            <Route path="/lobby" element={<LobbyScreen />} />

            {/* Ruta 3: La mesa de juego (necesita un ID de sala) */}
            <Route path="/room/:roomId" element={<GameScreen />} />

            {/* Comodín: Si ponen una ruta rara, volver al inicio */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;