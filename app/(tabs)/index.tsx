// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info } from 'lucide-react-native';
import HoursInput from '@/components/HoursInput';
import DateSelector from '@/components/DateSelector';
import { getWorkEntryByDate } from '@/utils/storage';
import { formatISODate } from '@/utils/dateUtils';
import { COLORS, FONTS } from '@/constants/theme';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAppContext } from '@/contexts/AppContext';

export default function InputScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const { refreshData } = useAppContext();

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
    // Trigger a refresh locally
    setRefreshKey((prevKey) => prevKey + 1);

    // Also refresh global data
    refreshData();
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.headerContainer}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Saisie</Text>
            <TouchableOpacity style={styles.infoButton} onPress={toggleInfo}>
              <Info size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <DateSelector date={selectedDate} onDateChange={handleDateChange} />
        </Animated.View>

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
              • Utilisez + et - pour ajuster les heures
            </Text>
            <Text style={styles.infoText}>
              • Touchez l'affichage des heures pour basculer entre 0 et 30
              minutes
            </Text>
            <Text style={styles.infoText}>
              • Indiquez si les heures sont notées ou non
            </Text>
            <Text style={styles.infoText}>
              • Naviguez entre les jours avec les flèches
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
    padding: 16,
    paddingBottom: 100, // Espace pour le tabBar
  },
  headerContainer: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  infoButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLightest,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
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
    lineHeight: 18,
    marginBottom: 2,
  },
});
