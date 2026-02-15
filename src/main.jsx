import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Importante: Inicializa los idiomas antes de renderizar

// Componente de carga simple mientras se leen los archivos JSON de idioma
const Loading = () => (
  <div className="min-h-screen bg-stone-900 text-stone-400 flex items-center justify-center">
    <h2>Cargando grimorio...</h2>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Suspense espera a que i18n cargue los archivos .json */}
    <Suspense fallback={<Loading />}>
        <App />
    </Suspense>
  </React.StrictMode>
);