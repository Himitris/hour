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
