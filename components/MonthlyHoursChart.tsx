// components/MonthlyHoursChart.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { WorkEntries } from '@/types';
import {
  getStartOfMonth,
  getEndOfMonth,
  getDatesInRange,
  formatISODate,
} from '@/utils/dateUtils';

interface MonthlyHoursChartProps {
  entries: WorkEntries;
  selectedDate: Date;
}

export default function MonthlyHoursChart({
  entries,
  selectedDate,
}: MonthlyHoursChartProps) {
  const startOfMonth = getStartOfMonth(selectedDate);
  const endOfMonth = getEndOfMonth(selectedDate);
  const datesInMonth = getDatesInRange(startOfMonth, endOfMonth);

  // Grouper les données par semaine pour l'affichage
  const chartData = useMemo(() => {
    // Initialiser le tableau avec 5 semaines (suffisant pour couvrir un mois)
    const weeks = [
      { weekNum: 1, billedHours: 0, unbilledHours: 0, total: 0, daysCount: 0 },
      { weekNum: 2, billedHours: 0, unbilledHours: 0, total: 0, daysCount: 0 },
      { weekNum: 3, billedHours: 0, unbilledHours: 0, total: 0, daysCount: 0 },
      { weekNum: 4, billedHours: 0, unbilledHours: 0, total: 0, daysCount: 0 },
      { weekNum: 5, billedHours: 0, unbilledHours: 0, total: 0, daysCount: 0 },
      { weekNum: 6, billedHours: 0, unbilledHours: 0, total: 0, daysCount: 0 },
    ];

    // Parcourir les dates du mois et accumuler les heures par semaine
    datesInMonth.forEach((dateStr, index) => {
      const entry = entries[dateStr];
      // Déterminer le numéro de semaine (0-indexed)
      const weekIndex = Math.floor(index / 7);

      if (weekIndex < weeks.length) {
        if (entry) {
          const billedHours = entry.isBilled !== false ? entry.hours || 0 : 0;
          const unbilledHours = entry.isBilled === false ? entry.hours || 0 : 0;

          weeks[weekIndex].billedHours += billedHours;
          weeks[weekIndex].unbilledHours += unbilledHours;
          weeks[weekIndex].total += billedHours + unbilledHours;
          if (billedHours > 0 || unbilledHours > 0) {
            weeks[weekIndex].daysCount += 1;
          }
        }
      }
    });

    // Filtrer pour n'inclure que les semaines avec des données
    return weeks.filter((week) => week.daysCount > 0);
  }, [entries, datesInMonth]);

  // Trouver la valeur maximale pour la normalisation
  const maxValue = Math.max(...chartData.map((w) => w.total), 40); // Au moins 40h pour l'échelle

  // Calculer le total mensuel
  const monthlyTotal = chartData.reduce((sum, week) => sum + week.total, 0);
  const monthlyBilled = chartData.reduce(
    (sum, week) => sum + week.billedHours,
    0
  );
  const monthlyUnbilled = chartData.reduce(
    (sum, week) => sum + week.unbilledHours,
    0
  );

  // Formatter le titre du mois
  const monthTitle = startOfMonth.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{monthTitle}</Text>

      <View style={styles.chartContainer}>
        {chartData.map((week, index) => {
          const billedHeight = (week.billedHours / maxValue) * 150; // 150px height max
          const unbilledHeight = (week.unbilledHours / maxValue) * 150;

          return (
            <View key={index} style={styles.weekColumn}>
              <View style={styles.barContainer}>
                {week.unbilledHours > 0 && (
                  <View
                    style={[
                      styles.bar,
                      styles.unbilledBar,
                      { height: unbilledHeight },
                    ]}
                  />
                )}
                {week.billedHours > 0 && (
                  <View
                    style={[
                      styles.bar,
                      styles.billedBar,
                      { height: billedHeight },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.weekLabel}>S{week.weekNum}</Text>
              <Text style={styles.hourValue}>
                {week.total > 0 ? `${week.total.toFixed(1)}h` : '-'}
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
          <Text style={styles.summaryValue}>{monthlyTotal.toFixed(1)}h</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Moyenne par semaine:</Text>
          <Text style={styles.summaryValue}>
            {chartData.length > 0
              ? (monthlyTotal / chartData.length).toFixed(1)
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
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: 10,
  },
  weekColumn: {
    alignItems: 'center',
    width: (Dimensions.get('window').width - 100) / 6, // Ajuster en fonction du nombre max de semaines
  },
  barContainer: {
    height: 150,
    width: 22,
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
  weekLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
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
