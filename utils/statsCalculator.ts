import { WorkEntries } from '@/types';
import {
  formatISODate,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getDatesInRange,
} from './dateUtils';

export const calculateDailyHours = (
  entries: WorkEntries,
  date: Date
): number => {
  const dateStr = formatISODate(date);
  return entries[dateStr]?.hours || 0;
};

export const calculateWeeklyHours = (
  entries: WorkEntries,
  date: Date = new Date()
): number => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = getEndOfWeek(date);
  const datesInWeek = getDatesInRange(startOfWeek, endOfWeek);

  return datesInWeek.reduce((total, dateStr) => {
    return total + (entries[dateStr]?.hours || 0);
  }, 0);
};

export const calculateDailyBilledHours = (
  entries: WorkEntries,
  date: Date
): number => {
  const dateStr = formatISODate(date);
  return entries[dateStr]?.isBilled === true ? entries[dateStr]?.hours || 0 : 0;
};

export const calculateDailyUnbilledHours = (
  entries: WorkEntries,
  date: Date
): number => {
  const dateStr = formatISODate(date);
  return entries[dateStr]?.isBilled === false
    ? entries[dateStr]?.hours || 0
    : 0;
};

export const calculateWeeklyBilledHours = (
  entries: WorkEntries,
  date: Date = new Date()
): number => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = getEndOfWeek(date);
  const datesInWeek = getDatesInRange(startOfWeek, endOfWeek);

  return datesInWeek.reduce((total, dateStr) => {
    return (
      total +
      (entries[dateStr]?.isBilled === true ? entries[dateStr]?.hours || 0 : 0)
    );
  }, 0);
};

export const calculateWeeklyUnbilledHours = (
  entries: WorkEntries,
  date: Date = new Date()
): number => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = getEndOfWeek(date);
  const datesInWeek = getDatesInRange(startOfWeek, endOfWeek);

  return datesInWeek.reduce((total, dateStr) => {
    return (
      total +
      (entries[dateStr]?.isBilled === false ? entries[dateStr]?.hours || 0 : 0)
    );
  }, 0);
};

export const calculateMonthlyBilledHours = (
  entries: WorkEntries,
  date: Date = new Date()
): number => {
  const startOfMonth = getStartOfMonth(date);
  const endOfMonth = getEndOfMonth(date);
  const datesInMonth = getDatesInRange(startOfMonth, endOfMonth);

  return datesInMonth.reduce((total, dateStr) => {
    return (
      total +
      (entries[dateStr]?.isBilled === true ? entries[dateStr]?.hours || 0 : 0)
    );
  }, 0);
};

export const calculateMonthlyUnbilledHours = (
  entries: WorkEntries,
  date: Date = new Date()
): number => {
  const startOfMonth = getStartOfMonth(date);
  const endOfMonth = getEndOfMonth(date);
  const datesInMonth = getDatesInRange(startOfMonth, endOfMonth);

  return datesInMonth.reduce((total, dateStr) => {
    return (
      total +
      (entries[dateStr]?.isBilled === false ? entries[dateStr]?.hours || 0 : 0)
    );
  }, 0);
};

export const getBillingStatusColor = (hours: number): string => {
  // Couleurs pour les heures non notées (dans des tons différents, peut-être verdâtres)
  if (hours === 0) return '#EEEEEE'; // No hours
  if (hours < 4) return '#D1FFE8'; // Light green
  if (hours < 6) return '#92FFCB'; // Medium green
  if (hours < 8) return '#5EFF9C'; // Darker green
  return '#33FF66'; // Very dark green for many hours
};

export const calculateMonthlyHours = (
  entries: WorkEntries,
  date: Date = new Date()
): number => {
  const startOfMonth = getStartOfMonth(date);
  const endOfMonth = getEndOfMonth(date);
  const datesInMonth = getDatesInRange(startOfMonth, endOfMonth);

  return datesInMonth.reduce((total, dateStr) => {
    return total + (entries[dateStr]?.hours || 0);
  }, 0);
};

export const calculateWeeklyAverage = (
  entries: WorkEntries,
  date: Date = new Date()
): number => {
  const totalHours = calculateWeeklyHours(entries, date);
  // Count days with entries in the week
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = getEndOfWeek(date);
  const datesInWeek = getDatesInRange(startOfWeek, endOfWeek);
  
  const daysWorked = datesInWeek.filter(dateStr => 
    entries[dateStr] && entries[dateStr].hours > 0
  ).length;
  
  return daysWorked > 0 ? totalHours / daysWorked : 0;
};

export const calculateMonthlyAverage = (
  entries: WorkEntries,
  date: Date = new Date()
): number => {
  const totalHours = calculateMonthlyHours(entries, date);
  // Count days with entries in the month
  const startOfMonth = getStartOfMonth(date);
  const endOfMonth = getEndOfMonth(date);
  const datesInMonth = getDatesInRange(startOfMonth, endOfMonth);
  
  const daysWorked = datesInMonth.filter(dateStr => 
    entries[dateStr] && entries[dateStr].hours > 0
  ).length;
  
  return daysWorked > 0 ? totalHours / daysWorked : 0;
};

export const getHoursIntensityColor = (hours: number): string => {
  if (hours === 0) return '#EEEEEE'; // No hours
  if (hours < 4) return '#D1E8FF'; // Light blue for few hours
  if (hours < 6) return '#92C1FF'; // Medium blue
  if (hours < 8) return '#5E9CFF'; // Darker blue
  return '#3366FF'; // Very dark blue for many hours
};