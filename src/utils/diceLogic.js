// Función auxiliar para tirar 1d6
const rollD6 = () => Math.floor(Math.random() * 6) + 1;

/**
 * Realiza una tirada de Trophy según el tipo y parámetros
 * @param {string} type - 'risk', 'combat', 'hunt', 'ruin'
 * @param {number} lightCount - Cantidad dados claros
 * @param {number} darkCount - Cantidad dados oscuros
 * @param {number} targetNumber - (Opcional) Para combate (Aguante del monstruo)
 */
export const performTrophyRoll = (type, lightCount, darkCount, targetNumber = 6) => {
  const lightRolls = [];
  const darkRolls = [];

  // 1. LANZAMIENTO FÍSICO
  // En tirada de Ruina, forzamos 0 claros y 1 oscuro
  if (type === 'ruin') {
    darkRolls.push(rollD6());
  } else {
    for (let i = 0; i < lightCount; i++) lightRolls.push(rollD6());
    for (let i = 0; i < darkCount; i++) darkRolls.push(rollD6());
  }

  // 2. CÁLCULOS BÁSICOS
  const allRolls = [...lightRolls, ...darkRolls];
  const highest = Math.max(...allRolls, 0); // 0 si no hay dados

  // Detectar si el dado Oscuro es el más alto (Mecánica de Ruina en Riesgo/Caza)
  const maxLight = Math.max(...lightRolls, 0);
  const maxDark = Math.max(...darkRolls, 0);
  // Es Ruina si el Oscuro es estrictamente mayor que el Claro más alto, o si empatan en el valor más alto
  // (Nota: En Trophy Gold, si empatan, se elige el Oscuro voluntariamente, pero aquí lo marcaremos como aviso)
  const isDarkHighest = (darkRolls.length > 0) && (maxDark >= maxLight) && (maxDark === highest);

  // 3. DETERMINAR RESULTADO (OUTCOME) SEGÚN TIPO
  let outcome = 'failure';
  let outcomeLabel = ''; // Texto para humanos

  switch (type) {
    case 'combat':
      // En combate, el éxito depende de superar el número del monstruo
      if (highest >= targetNumber) {
        outcome = 'success';
        outcomeLabel = '¡Golpe Acertado!';
      } else {
        outcome = 'failure';
        outcomeLabel = 'Fallo (Recibes Daño)';
      }
      break;

    case 'hunt':
      // Caza da Tokens
      if (highest === 6) {
        outcome = 'success';
        outcomeLabel = 'Ganas 1 Token';
      } else if (highest >= 4) {
        outcome = 'partial';
        outcomeLabel = 'Encuentras rastro (con coste)';
      } else {
        outcome = 'failure';
        outcomeLabel = 'El bosque se cierra...';
      }
      break;

    case 'ruin':
      // La tirada de Ruina es especial: El usuario debe comparar manualmente con su Ruina actual
      // porque aquí no tenemos acceso a su ficha. Devolvemos el valor.
      outcome = 'info';
      outcomeLabel = `Resultado: ${highest}`;
      break;

    case 'risk':
    default:
      // Riesgo Estándar
      if (highest === 6) {
        outcome = 'success';
        outcomeLabel = 'Éxito Total';
      } else if (highest >= 4) {
        outcome = 'partial';
        outcomeLabel = 'Éxito con coste';
      } else {
        outcome = 'failure';
        outcomeLabel = 'Fallo';
      }
      break;
  }

  // Devolvemos todo el paquete de datos
  return {
    type,
    lightRolls,
    darkRolls,
    highest,
    outcome,
    outcomeLabel,
    isDarkHighest,
    targetNumber
  };
};