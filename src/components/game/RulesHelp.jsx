import React from 'react';
import { X, AlertTriangle, Sword, Compass, Skull } from 'lucide-react';

const RulesHelp = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-trophy-panel border border-trophy-gold w-full max-w-2xl max-h-[85vh] flex flex-col rounded-lg shadow-2xl relative">
        
        {/* CABECERA */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-black/40">
          <h2 className="text-xl font-serif text-trophy-gold font-bold tracking-wider">CÓDICE DE REGLAS</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* CONTENIDO (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-sm text-gray-300">

          {/* 1. RIESGO */}
          <section>
            <h3 className="flex items-center gap-2 text-trophy-gold font-bold uppercase mb-3 border-b border-gray-700 pb-1">
              <AlertTriangle size={18} /> Tirada de Riesgo
            </h3>
            <p className="mb-2 italic text-gray-500">Cuando realizas una acción arriesgada o incierta.</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="font-bold text-white w-6">1-3</span>
                <span><strong className="text-red-400">Fallo:</strong> La situación empeora. El DJ describe cómo.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-white w-6">4-5</span>
                <span><strong className="text-yellow-400">Éxito con coste:</strong> Lo logras, pero surge una complicación o debes pagar un precio.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-white w-6">6</span>
                <span><strong className="text-green-400">Éxito total:</strong> Lo logras sin consecuencias negativas.</span>
              </li>
            </ul>
            <div className="mt-2 text-xs bg-gray-800 p-2 rounded border border-gray-700">
              <span className="text-trophy-red font-bold">Mecánica de Ruina:</span> Si incluyes un dado oscuro y es el más alto (o empata con el más alto), tu Ruina aumenta en 1.
            </div>
          </section>

          {/* 2. COMBATE */}
          <section>
            <h3 className="flex items-center gap-2 text-red-400 font-bold uppercase mb-3 border-b border-red-900/50 pb-1">
              <Sword size={18} /> Combate
            </h3>
            <p className="mb-2 italic text-gray-500">Mecánica de grupo contra monstruos. Requiere reducir el Aguante a 0.</p>
            <div className="space-y-2">
              <p><strong className="text-white">1. Reunir Dados:</strong></p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Cada jugador tira <strong>1 Dado Claro</strong> (Su Punto Débil).</li>
                <li>Se tiran tantos <strong>Dados Oscuros</strong> como combatientes haya (Ataque Grupal).</li>
              </ul>
              
              <p><strong className="text-white">2. Resolución:</strong></p>
              <p>Se suman todos los dados oscuros. Si la suma es <strong>igual o mayor al Aguante</strong>, el monstruo muere.</p>
              <p>Si es menor, no ocurre nada (el monstruo resiste). Debéis decidir si os retiráis o si continuáis.</p>
              
              <p><strong className="text-white">3. Escalar (Continuar luchando):</strong></p>
              <p>Si decidís seguir tras un fallo, añadid <strong>1 Dado Oscuro extra</strong> a la reserva y volved a tirar.</p>

              <div className="mt-2 text-xs bg-red-900/20 p-2 rounded border border-red-900/40 text-red-200">
                <span className="font-bold text-red-400">Peligro:</span> Si alguno de los dados oscuros muestra el mismo número que tu Dado Claro (Punto Débil), tu Ruina aumenta en 1.
              </div>
            </div>
          </section>

          {/* 3. EXPLORACIÓN */}
          <section>
            <h3 className="flex items-center gap-2 text-green-500 font-bold uppercase mb-3 border-b border-green-900/50 pb-1">
              <Compass size={18} /> Exploración (Caza)
            </h3>
            <p className="mb-2 italic text-gray-500">Para adentrarse en lo desconocido y buscar tesoros.</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="font-bold text-white w-8">1</span>
                <span><strong className="text-red-500">Desastre:</strong> Pierdes TODOS tus contadores y encuentras algo terrible.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-white w-8">2-3</span>
                <span><strong className="text-red-400">Fallo:</strong> Encuentras algo terrible.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-white w-8">4-5</span>
                <span><strong className="text-yellow-400">Éxito parcial:</strong> Ganas 1 contador, pero encuentras algo terrible.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-white w-8">6</span>
                <span><strong className="text-green-400">Éxito:</strong> Ganas 1 contador.</span>
              </li>
            </ul>
          </section>

          {/* 4. RUINA */}
          <section>
            <h3 className="flex items-center gap-2 text-gray-400 font-bold uppercase mb-3 border-b border-gray-700 pb-1">
              <Skull size={18} /> Reducir Ruina
            </h3>
            <p className="mb-2">Puedes intentar reducir tu Ruina relajándote, compartiendo intimidad o visitando tu hogar. Tira 1 dado oscuro.</p>
            <ul className="space-y-1">
              <li>Si sacas <strong>MÁS</strong> que tu Ruina actual: <span className="text-green-400">Ruina -1</span>.</li>
              <li>Si sacas <strong>MENOS o IGUAL</strong>: <span className="text-red-400">Ruina +1</span>.</li>
            </ul>
          </section>

        </div>
        
        {/* PIE */}
        <div className="p-4 border-t border-gray-700 bg-black/40 text-center text-xs text-gray-600">
          Trophy Gold System Reference Document
        </div>
      </div>
    </div>
  );
};

export default RulesHelp;