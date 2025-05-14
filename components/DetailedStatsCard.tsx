// components/DetailedStatsCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { formatHoursToDisplay } from '@/utils/timeFormatter';

interface DetailedStatsCardProps {
  title: string;
  totalValue: number;
  billedValue: number;
  unbilledValue: number;
  description?: string;
  animate?: boolean;
}

export default function DetailedStatsCard({
  title,
  totalValue,
  billedValue,
  unbilledValue,
  description,
  animate = true,
}: DetailedStatsCardProps) {
  // Animation pour la valeur
  const progress = useSharedValue(0);

  React.useEffect(() => {
    if (animate) {
      progress.value = 0;
      setTimeout(() => {
        progress.value = withTiming(1, { duration: 1000 });
      }, 300);
    } else {
      progress.value = 1;
    }
  }, [totalValue, billedValue, unbilledValue, animate]);

  const animatedValueStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ translateY: (1 - progress.value) * 10 }],
    };
  });

  // Calcul du pourcentage de chaque type d'heures
  const billedPercentage =
    totalValue > 0 ? (billedValue / totalValue) * 100 : 0;
  const unbilledPercentage =
    totalValue > 0 ? (unbilledValue / totalValue) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.valueContainer}>
        <Animated.Text style={[styles.value, animatedValueStyle]}>
          {formatHoursToDisplay(totalValue)}
        </Animated.Text>
      </View>

      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: `${billedPercentage}%`,
                backgroundColor: '#3366FF',
              },
              animatedValueStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.barFill,
              {
                width: `${unbilledPercentage}%`,
                backgroundColor: '#33CC66',
                position: 'absolute',
                left: `${billedPercentage}%`,
              },
              animatedValueStyle,
            ]}
          />
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <View
            style={[styles.colorIndicator, { backgroundColor: '#3366FF' }]}
          />
          <Text style={styles.detailLabel}>Notées:</Text>
          <Animated.Text style={[styles.detailValue, animatedValueStyle]}>
            {formatHoursToDisplay(billedValue)} ({billedPercentage.toFixed(0)}%)
          </Animated.Text>
        </View>

        <View style={styles.detailItem}>
          <View
            style={[styles.colorIndicator, { backgroundColor: '#33CC66' }]}
          />
          <Text style={styles.detailLabel}>Non notées:</Text>
          <Animated.Text style={[styles.detailValue, animatedValueStyle]}>
            {formatHoursToDisplay(unbilledValue)} (
            {unbilledPercentage.toFixed(0)}%)
          </Animated.Text>
        </View>
      </View>

      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#555555',
    marginBottom: 12,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#333333',
  },
  barContainer: {
    marginVertical: 12,
  },
  barBackground: {
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: {
    height: '100%',
  },
  detailsContainer: {
    marginTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  detailLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  detailValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999999',
    marginTop: 12,
  },
});
