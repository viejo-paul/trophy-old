import React, { useEffect, useRef, useState } from 'react';
import DiceBox from '@3d-dice/dice-box';

const DiceLayer3D = ({ messages }) => {
  const [diceBox, setDiceBox] = useState(null);
  const lastMsgIdRef = useRef(null);
  const containerRef = useRef(null); // Referencia al div contenedor

  // 1. INICIALIZAR EL MOTOR DE DADOS (Solo una vez)
  useEffect(() => {
    // Evitar doble inicialización
    if (diceBox) return;

    const box = new DiceBox("#dice-box-canvas", {
      id: "dice-canvas", // ID del canvas interno
      assetPath: "https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/assets/", // Cargamos assets desde la nube
      scale: 6, // Tamaño de los dados
      theme: "default",
      gravity: 1,
      mass: 1,
      friction: 0.8
    });

    box.init().then(() => {
      setDiceBox(box);
      console.log("DiceBox 3D Ready!");
    });

  }, []); // Array vacío = solo al montar

  // 2. ESCUCHAR MENSAJES Y LANZAR
  useEffect(() => {
    if (!messages || messages.length === 0 || !diceBox) return;

    const lastMsg = messages[messages.length - 1];

    if (lastMsgIdRef.current === lastMsg.id) return;

    if (['risk', 'combat', 'hunt', 'free'].includes(lastMsg.type)) {
       lastMsgIdRef.current = lastMsg.id;
       triggerRoll(lastMsg);
    }
  }, [messages, diceBox]);

  const triggerRoll = (rollData) => {
    // Limpiamos los dados anteriores antes de tirar
    diceBox.clear();

    const lightRolls = rollData.lightRolls || [];
    const darkRolls = rollData.darkRolls || [];

    // Preparamos la configuración de la tirada
    // DiceBox permite tirar grupos con diferentes colores
    const diceGroups = [];

    // GRUPO 1: DADOS CLAROS (Blancos #e5e5e5 con texto Negro)
    lightRolls.forEach(val => {
      diceGroups.push({
        sides: 6,
        themeColor: '#e5e5e5', // Fondo Blanco Hueso
        themeFontColor: '#000000', // Puntos Negros
        qty: 1,
        settleResult: val // FORZAMOS EL RESULTADO para que coincida con la lógica
      });
    });

    // GRUPO 2: DADOS OSCUROS (Negros #0f0f0f con texto Dorado)
    darkRolls.forEach(val => {
      diceGroups.push({
        sides: 6,
        themeColor: '#0f0f0f', // Fondo Negro
        themeFontColor: '#fbbf24', // Puntos Dorados (Trophy Gold)
        qty: 1,
        settleResult: val // FORZAMOS EL RESULTADO
      });
    });

    if (diceGroups.length === 0) return;

    // Reproducir sonido
    const audio = new Audio('/assets/sounds/dice-hit.mp3'); 
    audio.volume = 0.6;
    audio.play().catch(() => {});

    // LANZAR
    diceBox.roll(diceGroups);

    // Limpiar después de 5 segundos
    setTimeout(() => {
      diceBox.clear();
    }, 5000);
  };

  return (
    // Este contenedor siempre existe, pero pointer-events-none deja pasar los clics
    // El ID es crucial porque DiceBox busca "#dice-box-canvas"
    <div 
      id="dice-box-canvas"
      className="fixed inset-0 z-[100] pointer-events-none w-full h-full"
    ></div>
  );
};

export default DiceLayer3D;