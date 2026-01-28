import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingScreen from './views/LandingScreen';
import GameScreen from './views/GameScreen';

function App() {
  return (
    <BrowserRouter>
      {/* El Router decide qué componente pintar según la URL del navegador */}
      <Routes>
        {/* Ruta principal (Portada) */}
        <Route path="/" element={<LandingScreen />} />
        
        {/* Ruta del juego (ej: /game/sala123) */}
        <Route path="/game/:roomId" element={<GameScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;