// utils/timeFormatter.ts
/**
 * Convertit un nombre d'heures décimal en format d'affichage "Xh30"
 * @param hours Nombre d'heures en format décimal (ex: 7.5)
 * @param includeZeroMinutes Si true, affiche "Xh00" au lieu de "Xh" quand minutes = 0
 * @returns Chaîne formatée (ex: "7h30")
 */
export const formatHoursToDisplay = (
  hours: number,
  includeZeroMinutes: boolean = false
): string => {
  if (isNaN(hours) || hours < 0) return '0h';

  const fullHours = Math.floor(hours);
  const minutes = Math.round((hours - fullHours) * 60);

  // Quantiser à 0 ou 30 minutes pour l'affichage
  const displayMinutes =
    minutes >= 15 && minutes < 45 ? 30 : minutes >= 45 ? 0 : 0;
  const adjustedHours = minutes >= 45 ? fullHours + 1 : fullHours;

  if (displayMinutes === 0) {
    return includeZeroMinutes ? `${adjustedHours}h00` : `${adjustedHours}h`;
  } else {
    return `${adjustedHours}h30`;
  }
};
