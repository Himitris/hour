// components/StatsCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '@/constants/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { formatHoursToDisplay } from '@/utils/timeFormatter';

interface StatsCardProps {
  title: string;
  value: number;
  description?: string;
  color?: string;
  animate?: boolean;
}

export default function StatsCard({
  title,
  value,
  description,
  color = COLORS.primary,
  animate = true,
}: StatsCardProps) {
  // Animation for the value
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
  }, [value, animate]);

  const animatedValueStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ translateY: (1 - progress.value) * 10 }],
    };
  });

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueContainer}>
        <Animated.Text style={[styles.value, animatedValueStyle]}>
          {formatHoursToDisplay(value)}
        </Animated.Text>
      </View>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.medium,
    borderLeftWidth: 4,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.text,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
  },
});
