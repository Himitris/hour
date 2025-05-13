// components/CalendarLegend.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';

export default function CalendarLegend() {
  return (
    <View style={styles.container}>
      <View style={styles.legendRow}>
        <Text style={styles.legendTitle}>Heures notées:</Text>
        <View style={styles.colorsRow}>
          <View style={styles.colorGroup}>
            <View style={[styles.colorBox, { backgroundColor: '#D1E8FF' }]} />
            <Text style={styles.colorLabel}>{'<4h'}</Text>
          </View>
          <View style={styles.colorGroup}>
            <View style={[styles.colorBox, { backgroundColor: '#92C1FF' }]} />
            <Text style={styles.colorLabel}>4-6h</Text>
          </View>
          <View style={styles.colorGroup}>
            <View style={[styles.colorBox, { backgroundColor: '#5E9CFF' }]} />
            <Text style={styles.colorLabel}>6-8h</Text>
          </View>
          <View style={styles.colorGroup}>
            <View style={[styles.colorBox, { backgroundColor: '#3366FF' }]} />
            <Text style={styles.colorLabel}>{'>8h'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendTitle}>Non notées:</Text>
        <View style={styles.colorsRow}>
          <View style={styles.colorGroup}>
            <View style={[styles.colorBox, { backgroundColor: '#D1FFE8' }]} />
            <Text style={styles.colorLabel}>{'<4h'}</Text>
          </View>
          <View style={styles.colorGroup}>
            <View style={[styles.colorBox, { backgroundColor: '#92FFCB' }]} />
            <Text style={styles.colorLabel}>4-6h</Text>
          </View>
          <View style={styles.colorGroup}>
            <View style={[styles.colorBox, { backgroundColor: '#5EFF9C' }]} />
            <Text style={styles.colorLabel}>6-8h</Text>
          </View>
          <View style={styles.colorGroup}>
            <View style={[styles.colorBox, { backgroundColor: '#33FF66' }]} />
            <Text style={styles.colorLabel}>{'>8h'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendTitle: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textLight,
    width: '22%',
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '78%',
  },
  colorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  colorBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 3,
  },
  colorLabel: {
    fontFamily: FONTS.regular,
    fontSize: 8,
    color: COLORS.textLight,
  },
});
