// components/CalendarLegend.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';

export default function CalendarLegend() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Légende</Text>

      <View style={styles.legendSection}>
        <View style={styles.legendHeader}>
          <Text style={styles.legendSectionTitle}>Heures notées</Text>
        </View>
        <View style={styles.legendRow}>
          {[
            { color: COLORS.primaryLightest, label: '< 4h' },
            { color: COLORS.primaryLighter, label: '< 6h' },
            { color: COLORS.primaryLight, label: '< 8h' },
            { color: COLORS.primary, label: '≥ 8h' },
          ].map((item, index) => (
            <View key={`billed-${index}`} style={styles.legendItem}>
              <View
                style={[styles.colorSquare, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.legendSection}>
        <View style={styles.legendHeader}>
          <Text style={styles.legendSectionTitle}>Heures non notées</Text>
        </View>
        <View style={styles.legendRow}>
          {[
            { color: COLORS.secondaryLightest, label: '< 4h' },
            { color: COLORS.secondaryLighter, label: '< 6h' },
            { color: COLORS.secondaryLight, label: '< 8h' },
            { color: COLORS.secondary, label: '≥ 8h' },
          ].map((item, index) => (
            <View key={`unbilled-${index}`} style={styles.legendItem}>
              <View
                style={[styles.colorSquare, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  legendSection: {
    marginBottom: 12,
  },
  legendHeader: {
    marginBottom: 8,
  },
  legendSectionTitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textLight,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
  },
});
