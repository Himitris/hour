import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkEntry, WorkEntries, Payment } from '@/types';

const STORAGE_KEY = 'work_hours_data';
const PAYMENTS_STORAGE_KEY = 'payments_data';

// Fonctions pour les heures de travail
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
    if (jsonValue != null) {
      const entries = JSON.parse(jsonValue);

      // Migration: Ajouter le champ isBilled aux entrées existantes
      const migratedEntries = Object.entries(entries).reduce(
        (acc, [date, entry]) => {
          const typedEntry = entry as WorkEntry;
          // Si l'entrée n'a pas de champ isBilled, ajouter isBilled: true par défaut
          if (typedEntry.isBilled === undefined) {
            acc[date] = {
              ...typedEntry,
              isBilled: true, // Par défaut, considérer les anciennes entrées comme notées
            };
          } else {
            acc[date] = typedEntry;
          }
          return acc;
        },
        {} as WorkEntries
      );

      // Si des entrées ont été migrées, enregistrer les modifications
      if (JSON.stringify(migratedEntries) !== jsonValue) {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(migratedEntries)
        );
      }

      return migratedEntries;
    }
    return {};
  } catch (error) {
    console.error('Error retrieving work entries:', error);
    return {};
  }
};

export const getWorkEntryByDate = async (
  date: string
): Promise<WorkEntry | null> => {
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

// Nouvelles fonctions pour les paiements
export const getPayments = async (): Promise<Payment[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PAYMENTS_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error retrieving payments:', error);
    return [];
  }
};

export const storePayment = async (payment: Payment): Promise<void> => {
  try {
    const existingPayments = await getPayments();
    const updatedPayments = [...existingPayments, payment];
    await AsyncStorage.setItem(
      PAYMENTS_STORAGE_KEY,
      JSON.stringify(updatedPayments)
    );
  } catch (error) {
    console.error('Error storing payment:', error);
    throw error;
  }
};

export const deletePayment = async (paymentId: string): Promise<void> => {
  try {
    const existingPayments = await getPayments();
    const updatedPayments = existingPayments.filter(
      (payment) => payment.id !== paymentId
    );
    await AsyncStorage.setItem(
      PAYMENTS_STORAGE_KEY,
      JSON.stringify(updatedPayments)
    );
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

export const clearAllPayments = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PAYMENTS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing payments:', error);
    throw error;
  }
};
