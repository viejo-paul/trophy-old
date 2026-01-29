// Función auxiliar para tirar 1d6
const rollD6 = () => Math.floor(Math.random() * 6) + 1;

export const performTrophyRoll = (type, lightCount, darkCount, combatParams = {}) => {
  const lightRolls = [];
  const darkRolls = [];
  
  const { enemyEndurance, combatants } = combatParams;

  // 1. LANZAMIENTO
  if (type === 'combat') {
    if (lightCount > 0) lightRolls.push(rollD6()); 
    for (let i = 0; i < combatants; i++) darkRolls.push(rollD6()); 
  } else {
    // RIESGO, EXPLORACIÓN Y LIBRE usan los contadores normales
    for (let i = 0; i < lightCount; i++) lightRolls.push(rollD6());
    for (let i = 0; i < darkCount; i++) darkRolls.push(rollD6());
  }

  // 2. CÁLCULOS
  const allRolls = [...lightRolls, ...darkRolls];
  const highest = Math.max(...allRolls, 0);
  const maxLight = Math.max(...lightRolls, 0);
  const maxDark = Math.max(...darkRolls, 0);
  // Ruina solo aplica en Riesgo/Exploración/Combate
  const isDarkHighest = (type !== 'combat' && type !== 'free') && (darkRolls.length > 0) && (maxDark >= maxLight) && (maxDark === highest);

  // 3. RESULTADOS
  let outcome = 'info';
  let outcomeTitle = '';
  let outcomeDesc = '';
  
  // Datos combate
  let attackTotal = 0;
  let isVictory = false;

  switch (type) {
    case 'free': // --- TIRADA LIBRE (NUEVO) ---
      outcome = 'info';
      outcomeTitle = 'Tirada Libre';
      outcomeDesc = 'Sin reglas automáticas. Interpreta los dados según la situación.';
      break;

    case 'combat':
      attackTotal = darkRolls.reduce((a, b) => a + b, 0);
      isVictory = attackTotal >= enemyEndurance;
      const myWeakPoint = lightRolls[0];
      const matchFound = darkRolls.includes(myWeakPoint);

      if (isVictory) {
        outcome = 'success';
        outcomeTitle = `¡ENEMIGO ABATIDO! (Suma: ${attackTotal})`;
        outcomeDesc = `Vuestro ataque supera el Aguante (${enemyEndurance}).`;
      } else {
        outcome = 'partial';
        outcomeTitle = `Ataque Insuficiente (Suma: ${attackTotal})`;
        outcomeDesc = `No superáis el Aguante (${enemyEndurance}). AÑADID 1 DADO DE ATAQUE si continuáis.`;
      }
      
      if (matchFound) {
        outcomeDesc += ` | ¡RUINA! Tu Punto Débil (${myWeakPoint}) coincide con el ataque.`;
      }
      break;

    case 'risk':
      if (highest === 6) {
        outcome = 'success';
        outcomeTitle = 'Logras lo que quieres.';
        outcomeDesc = 'Describe cómo o pídele al DJ que lo describa él.';
      } else if (highest >= 4) {
        outcome = 'partial';
        outcomeTitle = 'Logras lo que quieres con coste.';
        outcomeDesc = 'El DJ determina la complicación.';
      } else {
        outcome = 'failure';
        outcomeTitle = 'Fracasas y todo va a peor.';
        outcomeDesc = 'El DJ describe cómo empeora la situación.';
      }
      break;

    case 'hunt':
      if (highest === 6) {
        outcome = 'success';
        outcomeTitle = 'Ganas un contador de exploración.';
        outcomeDesc = '';
      } else if (highest >= 4) {
        outcome = 'partial';
        outcomeTitle = 'Ganas contador, pero encuentras algo terrible.';
        outcomeDesc = '';
      } else if (highest >= 2) {
        outcome = 'failure';
        outcomeTitle = 'Encuentras algo terrible.';
        outcomeDesc = '';
      } else {
        outcome = 'critical_failure'; 
        outcomeTitle = 'Pierdes TODOS los contadores.';
        outcomeDesc = 'Encuentras algo terrible.';
      }
      break;

    default:
      outcomeTitle = 'Resultado...';
  }

  return {
    type,
    lightRolls,
    darkRolls,
    highest,
    outcome,
    outcomeTitle,
    outcomeDesc,
    isDarkHighest,
    attackTotal,
    enemyEndurance,
    isVictory
  };
};