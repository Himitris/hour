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
  return date.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
};

export const parseISODate = (dateString: string): Date => {
  return new Date(dateString);
};

export const getStartOfWeek = (date: Date): Date => {
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

export const getDatesInRange = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(formatISODate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export const getCurrentWeekDates = (): string[] => {
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const endOfWeek = getEndOfWeek(today);
  return getDatesInRange(startOfWeek, endOfWeek);
};

export const getCurrentMonthDates = (): string[] => {
  const today = new Date();
  const startOfMonth = getStartOfMonth(today);
  const endOfMonth = getEndOfMonth(today);
  return getDatesInRange(startOfMonth, endOfMonth);
};