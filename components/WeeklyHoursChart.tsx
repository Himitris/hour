// components/WeeklyHoursChart.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { WorkEntries } from '@/types';
import {
  getStartOfWeek,
  getDatesInRange,
  getEndOfWeek,
  formatISODate,
} from '@/utils/dateUtils';

interface WeeklyHoursChartProps {
  entries: WorkEntries;
}

export default function WeeklyHoursChart({ entries }: WeeklyHoursChartProps) {
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const endOfWeek = getEndOfWeek(today);
  const datesInWeek = getDatesInRange(startOfWeek, endOfWeek);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    return datesInWeek.map((dateStr, index) => {
      const entry = entries[dateStr];
      const billedHours = entry?.isBilled ? entry.hours : 0;
      const unbilledHours = entry?.isBilled === false ? entry.hours : 0;
      const total = billedHours + unbilledHours;

      return {
        day: weekDays[index],
        date: dateStr,
        billedHours,
        unbilledHours,
        total,
      };
    });
  }, [entries, datesInWeek]);

  // Trouver la valeur maximale pour la normalisation
  const maxValue = Math.max(...chartData.map((d) => d.total), 8); // Au moins 8h pour l'échelle

  // Calculer le total hebdomadaire
  const weeklyTotal = chartData.reduce((sum, day) => sum + day.total, 0);
  const weeklyBilled = chartData.reduce((sum, day) => sum + day.billedHours, 0);
  const weeklyUnbilled = chartData.reduce(
    (sum, day) => sum + day.unbilledHours,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aperçu de la semaine</Text>

      <View style={styles.chartContainer}>
        {chartData.map((day, index) => {
          const today = formatISODate(new Date()) === day.date;
          const billedHeight = (day.billedHours / maxValue) * 120; // 120px height max
          const unbilledHeight = (day.unbilledHours / maxValue) * 120;

          return (
            <View key={index} style={styles.dayColumn}>
              <View style={styles.barContainer}>
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
              <Text style={[styles.dayLabel, today && styles.todayLabel]}>
                {day.day}
              </Text>
              <Text style={styles.hourValue}>
                {day.total > 0 ? `${day.total}h` : '-'}
              </Text>
            </View>
          );
        })}
      </View>

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
  hourValue: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textLight,
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
});
