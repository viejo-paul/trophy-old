import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'
import { GameProvider } from './context/GameContext' // <--- 1. Importamos

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envolvemos la App con el Provider */}
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>,
)