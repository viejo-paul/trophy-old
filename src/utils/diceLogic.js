// Función para tirar un dado de 6 caras
const rollD6 = () => Math.floor(Math.random() * 6) + 1;

export const performTrophyRoll = (lightDiceCount, darkDiceCount) => {
  const lightRolls = [];
  const darkRolls = [];

  // 1. Tiramos los dados
  for (let i = 0; i < lightDiceCount; i++) lightRolls.push(rollD6());
  for (let i = 0; i < darkDiceCount; i++) darkRolls.push(rollD6());

  // 2. Calculamos el resultado más alto
  const allRolls = [...lightRolls, ...darkRolls];
  const highest = Math.max(...allRolls);

  // 3. Determinamos el éxito según reglas de Trophy
  // 1-3: Fallo, 4-5: Éxito parcial, 6: Éxito total
  let outcome = 'failure';
  if (highest >= 6) outcome = 'success';
  else if (highest >= 4) outcome = 'partial';

  // 4. Regla del Dado Oscuro
  // Si el dado más alto es Oscuro (y no hay uno Claro igual o mayor que lo anule)
  const maxLight = Math.max(...lightRolls, 0); // 0 si no hay dados claros
  const maxDark = Math.max(...darkRolls, 0);
  
  // En Trophy, si el dado oscuro es el más alto (o empata con el más alto), la Ruina aumenta.
  // (Nota: Las reglas varían levemente entre mesas, usamos la estándar Gold)
  const isDarkHighest = (maxDark >= maxLight) && (maxDark === highest);

  return {
    lightRolls,
    darkRolls,
    highest,
    outcome,
    isDarkHighest
  };
};