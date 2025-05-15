// utils/dateUtils.ts
// Format dates in a consistent way across the app

export const formatDateForDisplay = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString('fr-FR', options);
};

export const formatISODate = (date: Date): string => {
  // Créer une nouvelle date avec les mêmes valeurs, mais à midi pour éviter les problèmes de fuseau horaire
  const normalizedDate = new Date(date);
  normalizedDate.setHours(12, 0, 0, 0);
  return normalizedDate.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
};

export const parseISODate = (dateString: string): Date => {
  // Créer une date à midi pour éviter les problèmes de fuseau horaire
  const date = new Date(dateString);
  date.setHours(12, 0, 0, 0);
  return date;
};

export const getStartOfWeek = (date: Date): Date => {
  // Créer une nouvelle date pour ne pas modifier l'original
  const newDate = new Date(date);
  // Normaliser l'heure à midi pour éviter les problèmes de fuseau horaire
  newDate.setHours(12, 0, 0, 0);

  const day = newDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday

  const monday = new Date(newDate);
  monday.setDate(diff);
  monday.setHours(12, 0, 0, 0);
  return monday;
};

export const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(12, 0, 0, 0);
  return endOfWeek;
};

export const getStartOfMonth = (date: Date): Date => {
  const newDate = new Date(date.getFullYear(), date.getMonth(), 1);
  newDate.setHours(12, 0, 0, 0);
  return newDate;
};

export const getEndOfMonth = (date: Date): Date => {
  const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  newDate.setHours(12, 0, 0, 0);
  return newDate;
};

export const getDatesInRange = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(12, 0, 0, 0);

  // Copie de endDate pour ne pas la modifier
  const endDateCopy = new Date(endDate);
  endDateCopy.setHours(12, 0, 0, 0);

  while (currentDate <= endDateCopy) {
    dates.push(formatISODate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export const getCurrentWeekDates = (): string[] => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const startOfWeek = getStartOfWeek(today);
  const endOfWeek = getEndOfWeek(today);
  return getDatesInRange(startOfWeek, endOfWeek);
};

export const getCurrentMonthDates = (): string[] => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const startOfMonth = getStartOfMonth(today);
  const endOfMonth = getEndOfMonth(today);
  return getDatesInRange(startOfMonth, endOfMonth);
};

/**
 * Vérifie si deux dates sont dans la même semaine
 */
export const isSameWeek = (date1: Date, date2: Date): boolean => {
  const startOfWeek1 = getStartOfWeek(date1);
  const startOfWeek2 = getStartOfWeek(date2);
  
  return (
    startOfWeek1.getFullYear() === startOfWeek2.getFullYear() &&
    startOfWeek1.getMonth() === startOfWeek2.getMonth() &&
    startOfWeek1.getDate() === startOfWeek2.getDate()
  );
};

/**
 * Vérifie si deux dates sont dans le même mois
 */
export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
};

/**
 * Formate le nom du mois en version courte
 */
export const formatShortMonth = (date: Date): string => {
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
  ];
  return months[date.getMonth()];
};

/**
 * Obtient le nom du jour de la semaine
 */
export const getDayOfWeekName = (date: Date, short: boolean = false): string => {
  const days = short
    ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    : ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  
  return days[date.getDay()];
};

/**
 * Convertit une date en chaîne lisible pour l'affichage
 */
export const formatReadableDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return "Aujourd'hui";
  } else if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Hier';
  } else {
    return formatDateForDisplay(date);
  }
};

/**
 * Calcule la différence en jours entre deux dates
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // Millisecondes par jour
  // Normaliser les dates à minuit
  const normalizedDate1 = new Date(date1);
  normalizedDate1.setHours(0, 0, 0, 0);
  const normalizedDate2 = new Date(date2);
  normalizedDate2.setHours(0, 0, 0, 0);
  
  // Calculer la différence et la convertir en jours
  return Math.round(Math.abs((normalizedDate1.getTime() - normalizedDate2.getTime()) / oneDay));
};

/**
 * Obtient le premier et le dernier jour du mois précédent
 */
export const getPreviousMonth = (date: Date): { startOfMonth: Date; endOfMonth: Date } => {
  const previousMonth = new Date(date);
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  
  return {
    startOfMonth: getStartOfMonth(previousMonth),
    endOfMonth: getEndOfMonth(previousMonth)
  };
};

/**
 * Obtient le premier et le dernier jour du mois suivant
 */
export const getNextMonth = (date: Date): { startOfMonth: Date; endOfMonth: Date } => {
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  return {
    startOfMonth: getStartOfMonth(nextMonth),
    endOfMonth: getEndOfMonth(nextMonth)
  };
};

/**
 * Obtient le premier et le dernier jour de la semaine précédente
 */
export const getPreviousWeek = (date: Date): { startOfWeek: Date; endOfWeek: Date } => {
  const previousWeek = new Date(date);
  previousWeek.setDate(previousWeek.getDate() - 7);
  
  return {
    startOfWeek: getStartOfWeek(previousWeek),
    endOfWeek: getEndOfWeek(previousWeek)
  };
};

/**
 * Obtient le premier et le dernier jour de la semaine suivante
 */
export const getNextWeek = (date: Date): { startOfWeek: Date; endOfWeek: Date } => {
  const nextWeek = new Date(date);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return {
    startOfWeek: getStartOfWeek(nextWeek),
    endOfWeek: getEndOfWeek(nextWeek)
  };
};