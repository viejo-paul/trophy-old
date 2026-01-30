import React, { useEffect, useRef } from 'react';
import DiceBox from '@3d-dice/dice-box';

const DiceLayer3D = () => {
  const diceBoxRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    const initDice = async () => {
      // Configuramos la ruta absoluta para evitar que Vite se líe
      const box = new DiceBox({
        container: '#dice-box',
        assetPath: '/assets/', // Esto buscará en public/assets/
        scale: 6,
        theme: 'default',
        gravity: 1,
        mass: 1,
        friction: 0.8,
        // Forzamos a que no use Workers externos si da problemas
        offscreen: false 
      });

      try {
        await box.init();
        diceBoxRef.current = box;
        isInitialized.current = true;
        console.log("🎲 Dados 3D listos");
        box.clear();
      } catch (error) {
        console.error("Error iniciando dados 3D:", error);
      }
    };

    initDice();

    const handleTrigger = (e) => {
      if (diceBoxRef.current && e.detail) {
        // Ahora e.detail es el array de dados con colores que enviamos
        diceBoxRef.current.roll(e.detail);
      }
    };

    window.addEventListener('trigger-dice-roll', handleTrigger);

    return () => {
      window.removeEventListener('trigger-dice-roll', handleTrigger);
    };
  }, []);

  return (
    <div 
      id="dice-box" 
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: 9999, // Super capa por encima de todo
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh'
      }}
    />
  );
};

export default DiceLayer3D;