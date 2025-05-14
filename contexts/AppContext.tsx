// contexts/AppContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { WorkEntries, Payment } from '@/types';
import { getWorkEntries, getPayments } from '@/utils/storage';

type AppContextType = {
  workEntries: WorkEntries;
  payments: Payment[];
  loading: boolean;
  refreshData: () => Promise<void>;
  lastUpdated: number; // Timestamp de la dernière mise à jour
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [workEntries, setWorkEntries] = useState<WorkEntries>({});
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Charger les données au démarrage
  useEffect(() => {
    refreshData();
  }, []);

  // Fonction pour rafraîchir toutes les données
  const refreshData = async () => {
    setLoading(true);
    try {
      // Charger les entrées de travail
      const workEntriesData = await getWorkEntries();
      setWorkEntries(workEntriesData);

      // Charger les paiements
      const paymentsData = await getPayments();
      setPayments(paymentsData);

      // Mettre à jour le timestamp
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        workEntries,
        payments,
        loading,
        refreshData,
        lastUpdated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
