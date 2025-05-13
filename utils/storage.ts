import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkEntry, WorkEntries } from '@/types';

const STORAGE_KEY = 'work_hours_data';

export const storeWorkEntry = async (entry: WorkEntry): Promise<void> => {
  try {
    const existingData = await getWorkEntries();
    const updatedData = {
      ...existingData,
      [entry.date]: entry,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error storing work entry:', error);
    throw error;
  }
};

export const getWorkEntries = async (): Promise<WorkEntries> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (error) {
    console.error('Error retrieving work entries:', error);
    return {};
  }
};

export const getWorkEntryByDate = async (date: string): Promise<WorkEntry | null> => {
  try {
    const entries = await getWorkEntries();
    return entries[date] || null;
  } catch (error) {
    console.error(`Error retrieving work entry for date ${date}:`, error);
    return null;
  }
};

export const clearAllEntries = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing work entries:', error);
    throw error;
  }
};