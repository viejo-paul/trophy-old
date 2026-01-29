import React, { useEffect, useRef, useState } from 'react';
import ReactDice from 'react-dice-complete';

const DiceLayer3D = ({ messages }) => {
  const reactDice = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);
  
  // Guardamos el último mensaje procesado para no repetir tirada al cambiar de pestaña
  const lastMsgIdRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];

    // Si es una tirada nueva (comparamos ID o Timestamp si tuviéramos, aquí usamos referencia simple)
    if (lastMsgIdRef.current === lastMsg.id) return;
    
    if (['risk', 'combat', 'hunt', 'free'].includes(lastMsg.type)) {
       lastMsgIdRef.current = lastMsg.id;
       rollDice(lastMsg);
    }
  }, [messages]);

  const rollDice = (rollData) => {
    setShowOverlay(true);
    
    // Convertimos los resultados a un formato que la librería entienda
    // La librería pide tirar, pero nosotros ya tenemos el resultado del servidor (DiceLogic).
    // El truco es decirle a la librería: "Tira estos valores predeterminados".
    
    const allDiceValues = [...rollData.lightRolls, ...rollData.darkRolls];
    
    // Necesitamos diferenciar colores, pero esta librería tira todos del mismo color por defecto en el mismo grupo.
    // TRUCO: Tiramos todos juntos en negro/dorado para simplificar la visualización 3D, 
    // o usamos el resultado del chat para ver los colores exactos (claros/oscuros).
    // Para el efecto visual 3D, usaremos dados negros elegantes para todos.
    
    if (reactDice.current) {
      // Reiniciamos dados (limpiar mesa) y tiramos los nuevos
      reactDice.current.rollAll(allDiceValues);
    }

    // Sonido
    const audio = new Audio('/assets/sounds/dice-hit.mp3'); 
    audio.volume = 0.6;
    audio.play().catch(() => {});

    // Ocultar overlay después de unos segundos
    setTimeout(() => {
      setShowOverlay(false);
    }, 4500);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}>
       {/* El contenedor debe tener pointer-events-auto solo si queremos interactuar, pero mejor no para no bloquear clicks */}
       <div className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] relative">
          <ReactDice
            ref={reactDice}
            numDice={1} // Se sobrescribe al tirar
            defaultRoll={6}
            faceColor="#000000" // Negro
            dotColor="#fbbf24"  // Dorado (trophy-gold)
            dieSize={60}
            disableIndividual // No dejar que el usuario los toque
            rollTime={2} // Segundos rodando
            margin={15}
          />
       </div>
    </div>
  );
};

export default DiceLayer3D;