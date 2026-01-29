// Función auxiliar para tirar 1d6
const rollD6 = () => Math.floor(Math.random() * 6) + 1;

export const performTrophyRoll = (type, lightCount, darkCount, combatParams = {}) => {
  const lightRolls = [];
  const darkRolls = [];
  
  const { enemyEndurance, combatants } = combatParams; // combatants aquí representa el nº de dados oscuros actuales

  // 1. LANZAMIENTO
  if (type === 'ruin') {
    darkRolls.push(rollD6());
  } else if (type === 'combat') {
    if (lightCount > 0) lightRolls.push(rollD6()); // Mi punto débil
    for (let i = 0; i < combatants; i++) darkRolls.push(rollD6()); // Ataque conjunto (Dados oscuros)
  } else {
    for (let i = 0; i < lightCount; i++) lightRolls.push(rollD6());
    for (let i = 0; i < darkCount; i++) darkRolls.push(rollD6());
  }

  // 2. CÁLCULOS
  const allRolls = [...lightRolls, ...darkRolls];
  const highest = Math.max(...allRolls, 0);
  const maxLight = Math.max(...lightRolls, 0);
  const maxDark = Math.max(...darkRolls, 0);
  const isDarkHighest = (type !== 'combat') && (darkRolls.length > 0) && (maxDark >= maxLight) && (maxDark === highest);

  // 3. RESULTADOS Y TEXTOS
  let outcome = 'failure';
  let outcomeTitle = '';
  let outcomeDesc = '';
  
  let attackTotal = 0;
  let isVictory = false;

  switch (type) {
    case 'combat':
      // Suma de dados oscuros
      attackTotal = darkRolls.reduce((a, b) => a + b, 0);
      isVictory = attackTotal >= enemyEndurance;
      
      // Chequeo de Ruina (Punto Débil vs Dados Oscuros)
      const myWeakPoint = lightRolls[0];
      const matchFound = darkRolls.includes(myWeakPoint);

      if (isVictory) {
        outcome = 'success';
        outcomeTitle = `¡ENEMIGO ABATIDO! (Suma: ${attackTotal})`;
        outcomeDesc = `Vuestro ataque supera el Aguante (${enemyEndurance}). La bestia ha caído.`;
      } else {
        // CORRECCIÓN: Si no superas el aguante, NO haces daño.
        outcome = 'partial'; // Usamos 'partial' para que salga en amarillo (aviso)
        outcomeTitle = `Ataque Insuficiente (Suma: ${attackTotal})`;
        outcomeDesc = `No superáis el Aguante (${enemyEndurance}). Si queréis seguir luchando, AÑADID 1 DADO OSCURO a la reserva y tirad de nuevo.`;
      }
      
      if (matchFound) {
        outcomeDesc += ` | ¡CUIDADO! Tu Punto Débil (${myWeakPoint}) coincide con el ataque. Recibes 1 de Ruina.`;
      }
      break;

    case 'risk':
      if (highest === 6) {
        outcome = 'success';
        outcomeTitle = 'Logras lo que quieres.';
        outcomeDesc = 'Describe cómo o pídele al DJ que lo describa él.';
      } else if (highest >= 4) {
        outcome = 'partial';
        outcomeTitle = 'Logras lo que quieres, pero se produce complicación.';
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
        outcomeTitle = 'Pierdes TODOS los contadores y encuentras algo terrible.';
        outcomeDesc = 'Solo tú pierdes los contadores.';
      }
      break;

    case 'ruin':
      outcome = 'info';
      outcomeTitle = `Resultado: ${highest}`;
      outcomeDesc = 'Mayor que tu Ruina: Te salvas. Menor o igual: Ruina +1.';
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
    attackTotal, // Dato extra para mostrar la suma
    enemyEndurance,
    isVictory
  };
};