import React, { useEffect, useRef, useState } from 'react';
import ReactDice from 'react-dice-complete';

const DiceLayer3D = ({ messages }) => {
  const lightDiceRef = useRef(null);
  const darkDiceRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const lastMsgIdRef = useRef(null);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Cogemos el último mensaje
    const lastMsg = messages[messages.length - 1];

    // Evitamos repetir la misma tirada si ya la hemos hecho
    if (lastMsgIdRef.current === lastMsg.id) return;

    // Si es un tipo de mensaje que requiere dados
    if (['risk', 'combat', 'hunt', 'free'].includes(lastMsg.type)) {
       lastMsgIdRef.current = lastMsg.id;
       triggerRoll(lastMsg);
    }
  }, [messages]);

  const triggerRoll = (rollData) => {
    // 1. Primero mostramos el overlay (hacemos visible el contenedor)
    setShowOverlay(true);

    const lightValues = rollData.lightRolls || [];
    const darkValues = rollData.darkRolls || [];

    // 2. IMPORTANTE: Damos un pequeño respiro (100ms) para que React pinte el div
    // antes de decirle a la librería que calcule las físicas.
    setTimeout(() => {
      // Tirar Dados Claros
      if (lightDiceRef.current && lightValues.length > 0) {
        lightDiceRef.current.rollAll(lightValues);
      }

      // Tirar Dados Oscuros
      if (darkDiceRef.current && darkValues.length > 0) {
        darkDiceRef.current.rollAll(darkValues);
      }

      // Sonido
      const audio = new Audio('/assets/sounds/dice-hit.mp3'); 
      audio.volume = 0.6;
      audio.play().catch(() => {});
    }, 100);

    // 3. Ocultar todo después de 4.5 segundos
    setTimeout(() => {
      setShowOverlay(false);
    }, 4500);
  };

  // Si no hay overlay, usamos 'invisible' en lugar de no renderizar, 
  // para que la librería se mantenga cargada en memoria.
  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${showOverlay ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
    >
       <div className="flex items-center justify-center gap-8 md:gap-16">
          
          {/* GRUPO 1: DADOS CLAROS (Blanco Hueso) */}
          <div className={!showOverlay ? 'hidden' : ''}>
             <ReactDice
               ref={lightDiceRef}
               numDice={1}            
               defaultRoll={6}
               faceColor="#e5e5e5"    
               dotColor="#000000"     
               dieSize={60}           
               disableIndividual
               rollTime={2}
               margin={15}
             />
          </div>

          {/* GRUPO 2: DADOS OSCUROS (Negro y Dorado) */}
          <div className={!showOverlay ? 'hidden' : ''}>
             <ReactDice
               ref={darkDiceRef}
               numDice={1}
               defaultRoll={1}
               faceColor="#0f0f0f"    
               dotColor="#fbbf24"     
               dieSize={60}
               disableIndividual
               rollTime={2}
               margin={15}
             />
          </div>

       </div>
    </div>
  );
};

export default DiceLayer3D;