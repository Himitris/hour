// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
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
import { COLORS, FONTS } from '@/constants/theme';
import Animated, { FadeIn } from 'react-native-reanimated';

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
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Saisie du temps</Text>
            <TouchableOpacity style={styles.infoButton} onPress={toggleInfo}>
              <Info size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
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
            entering={FadeIn.duration(300)}
            style={styles.infoContainer}
          >
            <Text style={styles.infoTitle}>Comment utiliser</Text>
            <Text style={styles.infoText}>
              • Ajoutez vos heures et notez si elles sont facturables • Naviguez
              entre les jours avec les flèches • Ajoutez une note optionnelle
              pour votre activité
            </Text>
          </Animated.View>
        )}
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
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  infoButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLightest,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
  },
  infoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  infoText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
  },
});
