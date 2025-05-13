// app/(tabs)/payments.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlusCircle, RefreshCw, Trash2 } from 'lucide-react-native';
import DateSelector from '@/components/DateSelector';
import { COLORS, FONTS, SHADOWS } from '@/constants/theme';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { getPayments, storePayment, deletePayment } from '@/utils/storage';
import { formatDateForDisplay, formatISODate } from '@/utils/dateUtils';
import { Payment } from '@/types';

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const paymentsData = await getPayments();
      // Trier les paiements par date (plus récent en premier)
      const sortedPayments = paymentsData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setPayments(sortedPayments);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSavePayment = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    try {
      const paymentData: Payment = {
        id: Date.now().toString(), // Identifiant unique basé sur l'horodatage
        amount: parseFloat(amount),
        date: formatISODate(date),
        note: note.trim() || undefined,
      };

      await storePayment(paymentData);

      // Réinitialiser les champs
      setAmount('');
      setNote('');

      // Recharger la liste des paiements
      await loadPayments();

      Alert.alert('Succès', 'Paiement enregistré avec succès!');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du paiement:", error);
      Alert.alert('Erreur', "Une erreur est survenue lors de l'enregistrement");
    }
  };

  const handleDeletePayment = async (id: string) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce paiement?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePayment(id);
              await loadPayments();
            } catch (error) {
              console.error(
                'Erreur lors de la suppression du paiement:',
                error
              );
              Alert.alert('Erreur', 'Impossible de supprimer le paiement');
            }
          },
        },
      ]
    );
  };

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.paymentItem}>
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentDate}>
          {formatDateForDisplay(new Date(item.date))}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePayment(item.id)}
        >
          <Trash2 size={16} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
      <Text style={styles.paymentAmount}>{item.amount.toFixed(2)} €</Text>
      {item.note && <Text style={styles.paymentNote}>{item.note}</Text>}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Text style={styles.title}>Paiements</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadPayments}>
            <RefreshCw size={14} color={COLORS.primary} />
            <Text style={styles.refreshText}>Actualiser</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(300)}
          style={styles.inputCard}
        >
          <Text style={styles.inputTitle}>Nouveau paiement</Text>

          <View style={styles.amountInput}>
            <Text style={styles.label}>Montant (€)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Ex: 250.00"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.label}>Date</Text>
            <DateSelector date={date} onDateChange={handleDateChange} />
          </View>

          <View style={styles.noteInput}>
            <Text style={styles.label}>Note (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Ajouter une note..."
              multiline
              maxLength={100}
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSavePayment}
          >
            <PlusCircle size={18} color={COLORS.card} />
            <Text style={styles.addButtonText}>Ajouter le paiement</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.paymentsList}>
          <Text style={styles.paymentsTitle}>Historique des paiements</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : payments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun paiement enregistré</Text>
            </View>
          ) : (
            <FlatList
              data={payments}
              renderItem={renderPaymentItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLightest,
  },
  refreshText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
  },
  inputCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  inputTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  amountInput: {
    marginBottom: 12,
  },
  dateContainer: {
    marginBottom: 12,
  },
  noteInput: {
    marginBottom: 16,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    fontFamily: FONTS.regular,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    ...SHADOWS.button,
  },
  addButtonText: {
    color: COLORS.card,
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginLeft: 8,
  },
  paymentsList: {
    flex: 1,
  },
  paymentsTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  paymentItem: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentDate: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textLight,
  },
  deleteButton: {
    padding: 4,
  },
  paymentAmount: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 4,
  },
  paymentNote: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});
