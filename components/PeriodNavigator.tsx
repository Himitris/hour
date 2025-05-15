// components/PeriodNavigator.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react-native';
import { formatShortMonth, isSameMonth, isSameWeek } from '@/utils/dateUtils';
import { COLORS, FONTS, SHADOWS } from '@/constants/theme';
import Animated, { FadeIn } from 'react-native-reanimated';

interface PeriodNavigatorProps {
  selectedDate: Date;
  viewMode: 'week' | 'month';
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onToggleViewMode: () => void;
}

export default function PeriodNavigator({
  selectedDate,
  viewMode,
  onPrevious,
  onNext,
  onToday,
  onToggleViewMode,
}: PeriodNavigatorProps) {
  const today = new Date();

  // Détermine si la période actuelle inclut aujourd'hui
  const isCurrentPeriod = () => {
    if (viewMode === 'week') {
      return isSameWeek(selectedDate, today);
    } else {
      return isSameMonth(selectedDate, today);
    }
  };

  // Formatter la période pour l'affichage
  const getPeriodTitle = () => {
    if (viewMode === 'week') {
      // Pour la semaine, on affiche: "12 - 18 Juin 2025"
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay() + 1);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      // Si le début et la fin de la semaine sont dans le même mois
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${formatShortMonth(
          startOfWeek
        )} ${startOfWeek.getFullYear()}`;
      } else {
        // Si la semaine chevauche deux mois
        return `${startOfWeek.getDate()} ${formatShortMonth(
          startOfWeek
        )} - ${endOfWeek.getDate()} ${formatShortMonth(
          endOfWeek
        )} ${endOfWeek.getFullYear()}`;
      }
    } else {
      // Pour le mois, on affiche: "Juin 2025"
      return new Intl.DateTimeFormat('fr-FR', {
        month: 'long',
        year: 'numeric',
      }).format(selectedDate);
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navButton} onPress={onPrevious}>
          <ChevronLeft size={22} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.periodSelector}
          onPress={onToggleViewMode}
        >
          <Text style={styles.periodTitle}>{getPeriodTitle()}</Text>
          <View style={styles.viewModeToggle}>
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'week' ? styles.viewModeActive : {},
              ]}
            >
              Semaine
            </Text>
            <Text style={styles.viewModeSeparator}>|</Text>
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'month' ? styles.viewModeActive : {},
              ]}
            >
              Mois
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={onNext}>
          <ChevronRight size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {!isCurrentPeriod() && (
        <TouchableOpacity style={styles.todayButton} onPress={onToday}>
          <CalendarIcon size={16} color={COLORS.card} />
          <Text style={styles.todayText}>
            {viewMode === 'week' ? 'Semaine actuelle' : 'Mois actuel'}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  periodSelector: {
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 10,
    ...SHADOWS.small,
  },
  periodTitle: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 4,
  },
  viewModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
    paddingHorizontal: 6,
  },
  viewModeActive: {
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  viewModeSeparator: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textLight,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 8,
    alignSelf: 'center',
    marginTop: 10,
    ...SHADOWS.button,
  },
  todayText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.card,
    marginLeft: 6,
  },
});
