// Función auxiliar para tirar 1d6
const rollD6 = () => Math.floor(Math.random() * 6) + 1;

/**
 * Realiza una tirada de Trophy según el tipo y parámetros
 */
export const performTrophyRoll = (type, lightCount, darkCount, targetNumber = 6) => {
  const lightRolls = [];
  const darkRolls = [];

  // 1. LANZAMIENTO
  if (type === 'ruin') {
    darkRolls.push(rollD6());
  } else {
    for (let i = 0; i < lightCount; i++) lightRolls.push(rollD6());
    for (let i = 0; i < darkCount; i++) darkRolls.push(rollD6());
  }

  // 2. CÁLCULOS
  const allRolls = [...lightRolls, ...darkRolls];
  const highest = Math.max(...allRolls, 0);
  
  const maxLight = Math.max(...lightRolls, 0);
  const maxDark = Math.max(...darkRolls, 0);
  // Es Ruina si el Oscuro es estrictamente mayor, o si empatan en el valor más alto
  const isDarkHighest = (darkRolls.length > 0) && (maxDark >= maxLight) && (maxDark === highest);

  // 3. DETERMINAR RESULTADO (TEXTOS DEL LIBRO)
  let outcome = 'failure'; // 'success', 'partial', 'failure', 'critical_failure'
  let outcomeTitle = '';
  let outcomeDesc = '';

  switch (type) {
    case 'risk': // --- TIRADA DE RIESGO ---
      if (highest === 6) {
        outcome = 'success';
        outcomeTitle = 'Logras lo que quieres.';
        outcomeDesc = 'Describe cómo o pídele al DJ que lo describa él.';
      } else if (highest >= 4) {
        outcome = 'partial';
        outcomeTitle = 'Logras lo que quieres, pero se produce algún tipo de complicación.';
        outcomeDesc = 'El DJ será quien la determine; después, tú describes cómo logras lo que querías (o viceversa).';
      } else {
        outcome = 'failure';
        outcomeTitle = 'Fracasas y todo va a peor.';
        outcomeDesc = 'El DJ describe cómo, que puede estar (o no) relacionado con alguna de las ideas propuestas antes.';
      }
      break;

    case 'hunt': // --- TIRADA DE EXPLORACIÓN ---
      if (highest === 6) {
        outcome = 'success';
        outcomeTitle = 'Ganas un contador de exploración.';
        outcomeDesc = '';
      } else if (highest >= 4) {
        outcome = 'partial';
        outcomeTitle = 'Ganas un contador de exploración, pero también encuentras algo terrible.';
        outcomeDesc = '';
      } else if (highest >= 2) {
        outcome = 'failure';
        outcomeTitle = 'Encuentras algo terrible.';
        outcomeDesc = '';
      } else {
        // Caso especial: El dado más alto es un 1
        outcome = 'critical_failure'; 
        outcomeTitle = 'Pierdes todos tus contadores de exploración y encuentras algo terrible.';
        outcomeDesc = 'Solo el jugador que hizo la tirada pierde sus contadores.';
      }
      break;

    case 'combat': // --- TIRADA DE COMBATE (Pendiente de pulir en siguiente fase) ---
      if (highest >= targetNumber) {
        outcome = 'success';
        outcomeTitle = '¡Golpe Acertado!';
        outcomeDesc = 'Haces daño o ganas ventaja sobre el enemigo.';
      } else {
        outcome = 'failure';
        outcomeTitle = 'Fallo';
        outcomeDesc = 'El enemigo te ataca o la situación empeora.';
      }
      break;

    case 'ruin': // --- TIRADA DE RUINA ---
      outcome = 'info';
      outcomeTitle = `Resultado: ${highest}`;
      outcomeDesc = 'Si es mayor que tu Ruina actual, reduce tu Ruina en 1. Si es menor o igual, la Ruina aumenta.';
      break;

    default:
      outcomeTitle = 'Resultado desconocido';
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
    targetNumber
  };
};