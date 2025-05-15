// components/WeeklyHoursChart.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { WorkEntries } from '@/types';
import {
  getStartOfWeek,
  getDatesInRange,
  getEndOfWeek,
  formatISODate,
  formatDateForDisplay,
  parseISODate,
} from '@/utils/dateUtils';
import { AlertCircle } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface WeeklyHoursChartProps {
  entries: WorkEntries;
  selectedDate: Date;
  onDayPress?: (date: Date) => void;
}

export default function WeeklyHoursChart({
  entries,
  selectedDate,
  onDayPress,
}: WeeklyHoursChartProps) {
  const startOfWeek = getStartOfWeek(selectedDate);
  const endOfWeek = getEndOfWeek(selectedDate);
  const datesInWeek = getDatesInRange(startOfWeek, endOfWeek);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = formatISODate(new Date());

  // État pour le jour sélectionné dans le graphique
  const [highlightedDay, setHighlightedDay] = React.useState<string | null>(
    null
  );
  const [showDayDetails, setShowDayDetails] = React.useState(false);

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    return datesInWeek.map((dateStr, index) => {
      const entry = entries[dateStr];
      const billedHours = entry?.isBilled !== false ? entry?.hours || 0 : 0;
      const unbilledHours = entry?.isBilled === false ? entry?.hours || 0 : 0;
      const total = billedHours + unbilledHours;

      return {
        day: weekDays[index],
        date: dateStr,
        billedHours,
        unbilledHours,
        total,
        isToday: dateStr === today,
        note: entry?.note || '',
        isHighlighted: dateStr === highlightedDay,
      };
    });
  }, [entries, datesInWeek, today, highlightedDay]);

  // Trouver la valeur maximale pour la normalisation
  const maxValue = Math.max(...chartData.map((d) => d.total), 8); // Au moins 8h pour l'échelle

  // Calculer le total hebdomadaire
  const weeklyTotal = chartData.reduce((sum, day) => sum + day.total, 0);
  const weeklyBilled = chartData.reduce((sum, day) => sum + day.billedHours, 0);
  const weeklyUnbilled = chartData.reduce(
    (sum, day) => sum + day.unbilledHours,
    0
  );

  // Formattage de la semaine pour l'affichage du titre
  const weekTitle = `${startOfWeek.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })} - ${endOfWeek.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })}`;

  // Gérer l'appui sur un jour
  const handleDayPress = (dayInfo: (typeof chartData)[0]) => {
    if (dayInfo.total > 0) {
      setHighlightedDay(dayInfo.date);
      setShowDayDetails(true);

      // Si un callback externe est fourni
      if (onDayPress) {
        onDayPress(parseISODate(dayInfo.date));
      }
    }
  };

  // Obtenir les informations du jour sélectionné
  const getSelectedDayInfo = () => {
    return chartData.find((day) => day.date === highlightedDay);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Semaine du {weekTitle}</Text>

      <View style={styles.chartContainer}>
        {chartData.map((day, index) => {
          const isToday = day.isToday;
          const isHighlighted = day.isHighlighted;
          const billedHeight = (day.billedHours / maxValue) * 120; // 120px height max
          const unbilledHeight = (day.unbilledHours / maxValue) * 120;

          return (
            <TouchableOpacity
              key={index}
              style={styles.dayColumn}
              onPress={() => handleDayPress(day)}
              activeOpacity={day.total > 0 ? 0.7 : 1}
            >
              <View
                style={[
                  styles.barContainer,
                  isHighlighted && styles.highlighedBarContainer,
                ]}
              >
                {day.unbilledHours > 0 && (
                  <View
                    style={[
                      styles.bar,
                      styles.unbilledBar,
                      { height: unbilledHeight },
                    ]}
                  />
                )}
                {day.billedHours > 0 && (
                  <View
                    style={[
                      styles.bar,
                      styles.billedBar,
                      { height: billedHeight },
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  isToday && styles.todayLabel,
                  isHighlighted && styles.highlightedDayLabel,
                ]}
              >
                {day.day}
              </Text>
              <Text
                style={[
                  styles.hourValue,
                  isHighlighted && styles.highlightedHourValue,
                ]}
              >
                {day.total > 0 ? `${day.total}h` : '-'}
              </Text>

              {day.note && (
                <View style={styles.noteIndicator}>
                  <AlertCircle size={8} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {showDayDetails && highlightedDay && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.dayDetailsContainer}
        >
          <View style={styles.dayDetailsHeader}>
            <Text style={styles.dayDetailsTitle}>
              {formatDateForDisplay(parseISODate(highlightedDay))}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDayDetails(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {getSelectedDayInfo() && (
            <View style={styles.dayDetailsContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total:</Text>
                <Text style={styles.detailValue}>
                  {getSelectedDayInfo()?.total.toFixed(1)}h
                </Text>
              </View>

              {getSelectedDayInfo() && getSelectedDayInfo()!.billedHours > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Heures notées:</Text>
                  <Text style={styles.detailValue}>
                    {getSelectedDayInfo()!.billedHours.toFixed(1)}h
                  </Text>
                </View>
              )}

              {getSelectedDayInfo() && getSelectedDayInfo()!.unbilledHours > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Heures non notées:</Text>
                  <Text style={styles.detailValue}>
                    {getSelectedDayInfo()!.unbilledHours.toFixed(1)}h
                  </Text>
                </View>
              )}

              {getSelectedDayInfo()?.note && (
                <View style={styles.noteContainer}>
                  <Text style={styles.noteLabel}>Note:</Text>
                  <Text style={styles.noteText}>
                    {getSelectedDayInfo()?.note}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      )}

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.primary }]}
          />
          <Text style={styles.legendText}>Heures notées</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.secondary }]}
          />
          <Text style={styles.legendText}>Heures non notées</Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total:</Text>
          <Text style={styles.summaryValue}>{weeklyTotal.toFixed(1)}h</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Moyenne journalière:</Text>
          <Text style={styles.summaryValue}>
            {chartData.filter((d) => d.total > 0).length > 0
              ? (
                  weeklyTotal / chartData.filter((d) => d.total > 0).length
                ).toFixed(1)
              : '0.0'}
            h
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    marginBottom: 10,
  },
  dayColumn: {
    alignItems: 'center',
    width: (Dimensions.get('window').width - 80) / 7, // Ajustez en fonction de la largeur de l'écran
  },
  barContainer: {
    height: 120,
    width: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 3,
  },
  highlighedBarContainer: {
    backgroundColor: COLORS.primaryLightest,
    width: 20,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  billedBar: {
    backgroundColor: COLORS.primary,
  },
  unbilledBar: {
    backgroundColor: COLORS.secondary,
  },
  dayLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  todayLabel: {
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  highlightedDayLabel: {
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  hourValue: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textLight,
  },
  highlightedHourValue: {
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  noteIndicator: {
    position: 'absolute',
    top: 112, // Juste au-dessus des barres
    right: -2,
    backgroundColor: COLORS.card,
    borderRadius: 6,
    padding: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
  },
  summaryContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
  },
  dayDetailsContainer: {
    backgroundColor: COLORS.primaryLightest,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  dayDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 102, 255, 0.2)',
    paddingBottom: 6,
  },
  dayDetailsTitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
  },
  closeButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(51, 102, 255, 0.2)',
  },
  closeButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
    lineHeight: 20,
  },
  dayDetailsContent: {
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.text,
  },
  detailValue: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.text,
  },
  noteContainer: {
    marginTop: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 6,
    padding: 8,
  },
  noteLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  noteText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.text,
  },
});
