// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info } from 'lucide-react-native';
import HoursInput from '@/components/HoursInput';
import DateSelector from '@/components/DateSelector';
import { getWorkEntryByDate } from '@/utils/storage';
import { formatISODate } from '@/utils/dateUtils';
import { COLORS, FONTS, SHADOWS } from '@/constants/theme';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

export default function InputScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    checkForEntry();
  }, [selectedDate]);

  const checkForEntry = async () => {
    setLoading(true);
    try {
      const dateStr = formatISODate(selectedDate);
      await getWorkEntryByDate(dateStr);
    } catch (error) {
      console.error('Error checking for entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const handleSave = () => {
    // Trigger a refresh
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Saisie du temps</Text>
            <TouchableOpacity style={styles.infoButton} onPress={toggleInfo}>
              <Info size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Enregistrez vos heures travaillées
          </Text>
        </Animated.View>

        <DateSelector date={selectedDate} onDateChange={handleDateChange} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <Animated.View
            key={refreshKey}
            entering={FadeIn.duration(300)}
            style={styles.inputWrapper}
          >
            <HoursInput date={selectedDate} onSave={handleSave} />
          </Animated.View>
        )}

        {showInfo && (
          <Animated.View
            entering={SlideInDown.duration(300)}
            style={styles.infoContainer}
          >
            <Text style={styles.infoTitle}>Comment utiliser la saisie</Text>
            <Text style={styles.infoText}>
              • Utilisez cette page pour saisir vos heures de travail
              quotidiennes
            </Text>
            <Text style={styles.infoText}>
              • Naviguez entre les jours à l'aide des flèches ou revenez à
              aujourd'hui avec le bouton central
            </Text>
            <Text style={styles.infoText}>
              • Choisissez "Heures notées" pour les heures facturées à vos
              clients
            </Text>
            <Text style={styles.infoText}>
              • Ou "Non notées" pour les heures de travail interne, formation,
              etc.
            </Text>
            <Text style={styles.infoText}>
              • Ajoutez une note optionnelle pour vous rappeler de votre
              activité
            </Text>
          </Animated.View>
        )}
      </ScrollView>
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
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.text,
  },
  infoButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLightest,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textLight,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    ...SHADOWS.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
  },
  infoText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
    lineHeight: 20,
  },
});
