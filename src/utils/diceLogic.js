// Función auxiliar para tirar 1d6
const rollD6 = () => Math.floor(Math.random() * 6) + 1;

export const performTrophyRoll = (type, lightCount, darkCount, combatParams = {}) => {
  const lightRolls = [];
  const darkRolls = [];
  
  // Extraemos parámetros de combate si existen
  const { enemyEndurance, combatants } = combatParams;

  // 1. LANZAMIENTO
  if (type === 'ruin') {
    darkRolls.push(rollD6());
  } else if (type === 'combat') {
    // EN COMBATE:
    // lightCount será 1 (el dado del jugador para su Punto Débil)
    // darkCount será igual al número de combatientes (Ataque grupal)
    if (lightCount > 0) lightRolls.push(rollD6()); // Mi punto débil
    for (let i = 0; i < combatants; i++) darkRolls.push(rollD6()); // Ataque conjunto
  } else {
    // RIESGO / EXPLORACIÓN
    for (let i = 0; i < lightCount; i++) lightRolls.push(rollD6());
    for (let i = 0; i < darkCount; i++) darkRolls.push(rollD6());
  }

  // 2. CÁLCULOS GENERALES
  const allRolls = [...lightRolls, ...darkRolls];
  const highest = Math.max(...allRolls, 0);
  const maxLight = Math.max(...lightRolls, 0);
  const maxDark = Math.max(...darkRolls, 0);
  const isDarkHighest = (type !== 'combat') && (darkRolls.length > 0) && (maxDark >= maxLight) && (maxDark === highest);

  // 3. DETERMINAR RESULTADO Y TEXTOS
  let outcome = 'failure';
  let outcomeTitle = '';
  let outcomeDesc = '';
  
  // Datos extra para el combate
  let combatDamage = 0;
  let isVictory = false;
  let ruinMatches = [];

  switch (type) {
    case 'combat':
      // Regla: Sumar todos los dados oscuros
      combatDamage = darkRolls.reduce((a, b) => a + b, 0);
      isVictory = combatDamage >= enemyEndurance;
      
      // Chequeo de Ruina (Si mi dado claro coincide con algún oscuro)
      // Nota: Esto calcula si EL JUGADOR QUE PULSÓ EL BOTÓN recibe ruina.
      // Los demás jugadores tendrán que mirar los dados oscuros en el chat y comparar.
      const myWeakPoint = lightRolls[0];
      const matchFound = darkRolls.includes(myWeakPoint);

      if (isVictory) {
        outcome = 'success';
        outcomeTitle = `¡ENEMIGO DERROTADO! (Daño: ${combatDamage})`;
        outcomeDesc = `La suma del ataque (${combatDamage}) supera el Aguante (${enemyEndurance}).`;
      } else {
        outcome = 'partial'; // Lo ponemos partial para indicar que la pelea sigue
        const newEndurance = Math.max(0, enemyEndurance - combatDamage);
        outcomeTitle = `Golpeáis al enemigo (Daño: ${combatDamage})`;
        outcomeDesc = `El Aguante del enemigo baja a ${newEndurance}.`;
      }
      
      // Añadimos aviso de Ruina personal
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
    // Datos extra de combate para el chat
    combatDamage,
    enemyEndurance,
    isVictory
  };
};
